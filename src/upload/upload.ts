import { h, defineComponent, ref, watch, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { ajax } from '@wya/http';
import { Device, Utils } from '@wya/utils';
import { attrAccept, initItem } from './utils';
import { getUid } from '../utils/utils';
import { VcInstance, VcError } from '../vc/index';
import { Tips } from './tips';

export default {
	name: "vc-upload",
	props: {
		// 外层标签
		tag: {
			type: [String, Object, Function],
			default: 'span'
		},

		// 是否禁用
		disabled: {
			type: Boolean,
			default: false
		},

		// 选择文件时最多选择文件数量，> 1 就是多选上传
		max: {
			type: Number,
			default: 1
		},

		// 上传类型限制
		accept: String,

		// 文件大小
		size: {
			type: Number,
			default: 0
		},

		// request
		request: {
			type: Function,
			default: ajax
		},

		// ajax url
		url: String,

		// ajax额外的数据
		extra: {
			type: Object,
			default: () => ({})
		},

		// ajax额外的数据
		async: {
			type: Boolean,
			default: true
		},

		// ajax headers
		headers: {
			type: Object,
			default: () => ({})
		},

		// 上传类型为文件
		mode: {
			type: String,
			default: '' // file | image | video | ...
		},

		// 给后端的字段名
		name: {
			type: String,
			default: ''
		},

		showTips: {
			type: Boolean,
			default: false
		},

		// 选取文件夹
		directory: {
			type: Boolean,
			default: false
		},

		// 增强器，如：原生选取
		enhancer: Function,

		// 并行上传
		parallel: {
			type: Boolean,
			default: true
		},
	},
	emits: [
		'error', 
		'begin', 
		'post-before', 
		'post-after', 
		'file-before', 
		'file-start', 
		'file-progress', 
		'file-success', 
		'file-error',
		'complete'
	],
	setup(props, context) {
		const instance = getCurrentInstance();
		const { emit, slots } = context;

		const uid = ref(undefined);
		const input = ref(null);

		let reqs = {};
		let __isMounted = false;
		let cycle = {};
		let tips;

		const setDefaultCycle = () => {
			cycle = {
				error: 0,
				success: 0,
				total: 0,
				imgs: [],
				fns: []
			};
		};
		setDefaultCycle();

		const done = (file) => {
			cycle.total++;

			// 顺序上传
			if (
				!props.parallel 
				&& cycle.fns 
				&& cycle.fns.length > 0
			) {
				(cycle.fns.shift())();
			}

			// 上传完毕
			if (cycle.total === file.total) {

				emit('complete', { ...cycle } || {});
				setDefaultCycle();

				// tips
				tips && tips.setTipsStatus(true);
			}
		};

		const cancel = (file) => {
			if (file) {
				let $uid = file;
				if (file && file.uid) {
					$uid = file.uid;
				}
				if (reqs[$uid]) {
					reqs[$uid].cancel();
					done(file);
					delete reqs[$uid];
				}
			} else {
				Object.keys(reqs).forEach(($uid) => {
					if (reqs[$uid]) {
						reqs[$uid].cancel();
						done(file);
					}
					delete reqs[$uid];
				});
			}
		};

		const post = (file) => {
			if (!__isMounted) {
				return;
			}
			const { async, url, mode, name, headers, extra = {} } = props;

			const { 
				url: remote, 
				name: formName, 
				onPostBefore, 
				onPostAfter 
			} = VcInstance.config.Upload || {};

			// 上传前/后的回调
			const onBefore = instance.vnode.props?.onPostBefore || onPostBefore || (() => {});
			const onAfter = instance.vnode.props?.onPostAfter || onPostAfter;

			const { uid: $uid } = file;
			const { request, size } = props;
			let localData;
			if (size && file.size > size * 1024 * 1024) {
				localData = {
					status: 0,
					message: `上传失败，大小限制为${size}MB`
				};
			}
			
			// onFileStart, onFileProgress, onFileSuccess, onFileError, onComplete 
			emit('file-start', file);
			
			return request({
				url: url || (typeof url === 'object' ? remote[mode] : remote),
				type: "FORM",
				param: {
					...extra, 
					[name || formName || 'file']: file, // oss特殊场景, 需要file作为最后一个字段
				},
				async,
				headers,
				localData,
				onBefore,
				onAfter,
				onProgress: e => {
					emit('file-progress', e, file);
					tips && tips.setValue($uid, 'percent', e.percent);
				},
				getInstance: ({ xhr, cancel: $cancel }) => (reqs[$uid] = { $cancel })
			}).then((res) => {
				delete reqs[$uid];
				cycle.success++;
				cycle.imgs = [...cycle.imgs, res];

				emit('file-success', res, file, { ...cycle });

				// tips
				tips && tips.setValue($uid, 'success');
			}).catch((e) => {
				delete reqs[$uid];
				cycle.error++;

				emit('file-error', e, file, { ...cycle });

				// tips
				tips && tips.setValue($uid, 'error', e.message || e.msg || '上传失败');
			}).finally(() => done(file));
		};

		const upload = (file, fileList, index) => {
			const { onFileBefore } = instance.vnode.props || {};

			if (!onFileBefore) {
				// 总是异步的，以防使用react状态保存文件列表。
				setTimeout(() => post(file), 0);
				return;
			}

			const before = onFileBefore(file, fileList);
			if (before && before.then) {
				before.then((processedFile) => {
					if (processedFile instanceof Blob) {
						try {
							const { uid: $uid, current, total, percent } = file;
							processedFile.uid = $uid;
							processedFile.current = current;
							processedFile.total = total;
							processedFile.percent = percent;
							post(processedFile);
						} catch (e) {
							post(processedFile);
						}
					} else {
						post(file);
					}
				}).catch(e => {
					cycle.error++;
					// tips
					tips && tips.setValue(file.uid, 'error', e.message || e.msg || '上传失败');
					done(file);

					throw new VcError('upload', e);
				});
			} else if (before !== false) {
				setTimeout(() => post(file), 0);
			}
		};

		const uploadFiles = (files) => {
			let postFiles = Array.prototype.slice.call(files);

			postFiles = postFiles.filter(
				file => attrAccept(file, props.accept)
			);

			const length = postFiles.length;

			if (length === 0) {
				emit('error', { message: `文件格式限制：${props.accept}` });
				return;
			} else if (length > props.max) {
				emit('error', { 
					message: !props.directory 
						? `可选文件数量不能超过${props.max}个` 
						: `文件夹内文件的数量不能超过${props.max}个`
				});
				return;
			}
			
			// reset
			setDefaultCycle();
			
			emit('begin', postFiles);
			
			cycle.fns = postFiles.map((file, index) => {
				file.uid = getUid();
				file.current = index + 1;
				file.total = length;
				file.percent = 0;
				return () => {
					upload(file, postFiles);
				};
			});

			// 是否启用并行操作
			props.parallel 
				? cycle.fns.forEach(fn => fn())
				: (cycle.fns.shift())(); 

			// tips
			tips && tips.show(
				initItem(
					postFiles.map(it => ({ 
						...it, 
						size: it.size, 
						name: it.name, 
					})), 
					'uid'
				)
			);
		};

		const handleClick = (e) => {
			const el = input.value;
			if (e.target.tagName === 'INPUT' || !el) {
				return;
			}

			/**
			 * 渐进增强
			 */
			let { enhancer } = VcInstance.config.Upload || {};

			enhancer = props.enhancer || enhancer || (() => false);
			let allow = enhancer(instance);
			if (allow && allow.then) {
				allow.catch(() => {
					el.click();
				});
				return;
			}
			allow || el.click();
		};

		const handleChange = (e) => {
			uploadFiles(e.target.files);

			uid.value = getUid();
		};

		const handleFileDrop = (e) => {
			if (e.type === 'dragover') {
				e.preventDefault();
				return;
			}
			uploadFiles(e.dataTransfer.files);
			e.preventDefault();
		};

		const handleKeyDown = (e) => {
			if (e.key === 'Enter') {
				handleClick();
			}
		};

		// 对外暴露 uploadFiles 方法
		if (instance && instance.proxy) {
			instance.proxy.uploadFiles = uploadFiles;
		}

		onMounted(() => {
			__isMounted = true;
			if (!props.showTips) return;

			let app = Tips.popup({
				cName: getUid()
			});

			tips = app.wrapper;
		});

		onUnmounted(() => {
			__isMounted = false;
			tips && tips.$emit('portal-fulfilled');
			cancel();
		});

		// class
		const classes = computed(() => {
			return [
				{
					'vc-upload': true,
					'vc-upload-disabled': props.disabled,
				}
			];
		});

		const events = computed(() => {
			return props.disabled ? {} : {
				onClick: handleClick,
				// keydown: handleKeyDown,
				onDrop: handleFileDrop,
				onDragover: handleFileDrop
			};
		});

		// 上传
		const inputProps = computed(() => {
			let result = {
				ref: (el) => (input.value = el),
				key: uid.value,
				type: 'file',
				accept: props.accept,
				multiple: props.max > 1,
				webkitdirectory: props.directory,
				style: {
					display: 'none'
				},
				onChange: handleChange
			};

			// 解决安卓手机上传图片没有拍照选项
			// 目前已经不需要了，否则安卓端无法打开相册，只有相机 @2022-09-17 13:45:22;如果低版本存在，在考虑适配
			// if (Device.android) {
			// 	result.capture = true;
			// }
			return result;
		});
		

		return () => {
			return h(
				props.tag, 
				{
					class: classes.value,
					...events.value
				}, 
				[
					h('input', inputProps.value), 
					slots?.default?.()
				]
			);
		};
	}
};
