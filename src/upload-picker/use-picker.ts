import { getCurrentInstance, ref, computed, watch, inject } from 'vue';
import { Device } from '@wya/utils';
import Message from '../message/index';
import Toast from '../toast/index';
import { VcInstance } from '../vc/index';
import { recognizer, FILE_ACCEPT_MAP } from './utils';
import { compressImg } from '../utils';

const { DOC_ACCEPTS, EXCEL_ACCEPTS, PPT_ACCEPTS, PDF_ACCEPTS, TXT_ACCEPTS, HTML_ACCEPTS } = FILE_ACCEPT_MAP;
const isEmpty = (dataSource) => {
	const { image, video, audio, file } = dataSource;
	if (image.length || video.length || audio.length || file.length) return false;
	return true;
};

export default () => {
	const instance = getCurrentInstance();
	const formItem = inject('form-item', {});
	const { props, emit } = instance;
	const currentValue = ref({
		image: [],
		video: [],
		audio: [],
		file: []
	});
	const currentUploadOptions = ref({ 
		image: {
			accept: 'image/gif,image/jpeg,image/jpg,image/png',
			...(props.uploadOptions.image || {})
		},
		video: {
			accept: 'video/*',
			...(props.uploadOptions.video || {})
		},
		audio: {
			accept: 'audio/*',
			...(props.uploadOptions.audio || {})
		},
		file: {
			accept: `${DOC_ACCEPTS},${EXCEL_ACCEPTS},${PPT_ACCEPTS},${PDF_ACCEPTS},${TXT_ACCEPTS},${HTML_ACCEPTS}`,
			...(props.uploadOptions.file || {}),
		}
	});

	const dynamicMax = computed(() => {
		const image = currentValue.value.image || [];
		const video = currentValue.value.video || [];
		const audio = currentValue.value.audio || [];
		const file = currentValue.value.file || [];

		// 如果过滤出上传成功的文件，在上传中时，currentValue占位，达到max，upload控件仍不会隐藏，用户可以再次上传，导致会超出max
		let imageCount = image.length || 0;
		let videoCount = video.length || 0;
		let audioCount = audio.length || 0;
		let fileCount = file.length || 0;
		
		if (typeof props.max === 'number') {
			let curNum = imageCount + videoCount + audioCount + fileCount;
			const leftNum = props.max - curNum;
			return {
				image: leftNum,
				video: leftNum,
				audio: leftNum,
				file: leftNum,
			};
		} else if (typeof props.max === 'object') {
			const { image: $image, video: $video, audio: $audio, file: $file } = props.max;
			const max = {};
			$image && (max.image = $image - imageCount);
			$video && (max.video = $video - videoCount);
			$audio && (max.audio = $audio - audioCount);
			$file && (max.file = $file - fileCount);
			return max;
		}
		return {};
	});

	const multiple = computed(() => {
		const { image, video, audio, file } = dynamicMax.value;
		return {
			image: image >= 1,
			video: video >= 1,
			audio: audio >= 1,
			file: file >= 1,
		};
	});


	const sync = (v) => {
		emit('update:modelValue', v);
		emit('change', v);

		// form表单
		formItem.change?.(v);
	};

	const _recognizer = (url) => {
		const fn = (VcInstance.config.UploadPicker || {}).recognizer || recognizer;
		return fn(url, recognizer);
	};

	const parseDataSource = (dataSource) => {
		const initialData = { image: [], video: [], audio: [], file: [] };
		return dataSource.reduce((pre, cur) => {
			// TODO: 建议统一使用Object[] 而不是String[]
			if (cur && typeof cur === 'object') {
				cur = cur[props.urlKey];
			}
			switch (_recognizer(cur)) {
				case 'image':
					pre.image.push(cur);
					return pre;
				case 'video':
					pre.video.push(cur);
					return pre;
				case 'audio':
					pre.audio.push(cur);
					return pre;
				case 'file':
					pre.file.push(cur);
					return pre;
				default:
					return pre;
			}
		}, initialData);
	};

	const formatDataSource = (dataSource, type) => {
		dataSource = {
			...currentValue.value,
			[type]: dataSource
		};
		return props.picker.reduce((pre, cur) => {
			return pre.concat(dataSource[cur] || []);
		}, []);
	};
	
	const getUrl = (res) => {
		return props.formatter 
			? props.formatter(res) 
			: typeof res === 'string'
				? res 
				: (typeof res === 'object' && res?.data?.[props.urlKey]) || res[props.urlKey];
	};

	const handleFileBefore = async (file, fileList, type) => {
		if (props.compressOptions.compress && type === 'image') { // 图片是否压缩
			file = await compressImg({ file, ...props.compressOptions });
		}
		return new Promise((resolve, reject) => {
			const { onFileBefore } = instance.vnode.props; 

			if (!onFileBefore) return resolve(file);
			const before = onFileBefore(file, fileList, type);
			if (before && before.then) {
				before.then((processedFile) => {
					resolve(processedFile);
				}).catch(e => {
					reject(e);
				});
			} else {
				resolve(file);
			}
		});
	};

	const handleFileStart = (res, type) => {
		res.title = res.name;
		currentValue.value[type].push(res);
		emit('file-start', res, type);
	};

	const handleFileProgress = (e, file, type) => {
		if (parseInt(e.percent, 10) <= 100) {
			currentValue.value[type] = currentValue.value[type].map((item) => {
				if (file.uid === item.uid) {
					return {
						...item,
						percent: e.percent
					};
				}
				return item;
			});
		}
	};

	const handleFileSuccess = (res, file, cycle, type) => {
		let dataSource;
		currentValue.value[type] = currentValue.value[type].map((item) => {
			if (item.uid === file.uid) {
				// 图片、视频 String[]
				if (['image', 'video', 'audio'].includes(type)) {
					return getUrl(res);
				} else { // 其他文件，要求文件为对象Object[]
					let result = { ...item, ...((res.data ? res.data : res) || {}) };
					return props.formatter ? props.formatter(result) : result;
				}
			}
			return item;
		});
		// 将已经上传成功的文件传递给外部
		dataSource = currentValue.value[type].filter((it) => !it.errorFlag && getUrl(res));
		dataSource = formatDataSource(dataSource, type);
		emit('success', res, file, cycle, type);
		sync(dataSource);
	};

	const handleError = (err, type, file) => {
		let { onError } = instance.vnode.props;
		!onError && (Device.touch ? Toast.info(err.msg, 2) : Message.error(err.msg, 2));
		emit('error', err, type, file);
	};

	const handleFileError = (res, file, cycle, type) => {
		// 内部保存上传失败的文件，不传递给外层
		currentValue.value[type] = currentValue.value[type].map((item) => {
			if (item.uid === file.uid) {
				return {
					name: file.name,
					type: file.type,
					...item,
					...res,
					errorFlag: new Date().getTime()
				};
			}
			return item;
		});
		handleError(res, type, file);
	};

	const handleFileComplete = (res, type) => {
		emit('complete', res, type);
	};

	const delData = (index, type) => {
		const target = currentValue.value[type];
		const item = target[index];
		if (!item) {
			console.error('【vc-upload-picker】: 没有找到要删除的元素');
			return;
		}
		if (item.errorFlag) {
			currentValue.value[type] = target.filter(it => it.uid != item.uid);
			return;
		}
		target.splice(index, 1);
		let dataSource = target.filter(it => !it.errorFlag);
		dataSource = formatDataSource(dataSource, type);
		sync(dataSource);
	};

	const handleDel = (index, type) => {
		const { onRemoveBefore } = instance.vnode.props;
		const fn = onRemoveBefore && onRemoveBefore();
		if (fn && fn.then) {
			fn.then(() => {
				delData(index, type);
			});
		} else {
			delData(index, type);
		}
	};

	const handleSortChange = (value, type) => {
		currentValue.value[type] = value;
		let dataSource = value.filter(it => !it.errorFlag);
		dataSource = formatDataSource(dataSource, type);
		emit('update:modelValue', dataSource);
		emit('change', dataSource);
	};

	/**
	 * 对外暴露
	 */
	const $delete = (index, type) => {
		handleDel(index, type);
	};

	/**
	 * 增加
	 */
	const add = (source, type) => {
		if (!(source instanceof Array)) {
			source = [source];
		}
		source = source.filter(it => !!it);
		if (source.length) {
			currentValue.value[type].push(...source);
			let dataSource = currentValue.value[type].filter(it => !it.errorFlag);
			dataSource = formatDataSource(dataSource, type);
			sync(dataSource);
		}
	};

	/**
	 * 重置value
	 */
	const reset = (source = []) => {
		if (!(source instanceof Array)) {
			console.error('【vc-upload-picker】: reset参数要为字符串数组');
			return;
		}
		currentValue.value = parseDataSource(source);
		// form表单
		formItem.change?.(currentValue.value);
	};

	watch(
		() => props.modelValue,
		(v) => {
			currentValue.value = isEmpty(currentValue.value) || v.length === 0 ? parseDataSource(v) : currentValue.value;
		},
		{ immediate: true }
	);


	return {
		currentValue,
		currentUploadOptions,
		dynamicMax,
		multiple,

		delete: $delete,
		add,
		reset,
		handleDel,
		handleSortChange,
		handleFileBefore,
		handleFileStart,
		handleFileProgress,
		handleFileSuccess,
		handleFileError,
		handleError,
		handleFileComplete,
	};
};