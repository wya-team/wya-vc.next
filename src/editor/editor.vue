<template>
	<div class="vc-quill-editor">
		<slot name="toolbar">
			<vc-editor-toolbar 
				ref="toolbar"
				:toolbar="options.modules.toolbar"
				:uid="uid"
			>
				<button class="vc-quill-editor__icon">
					<!-- 手机端建议用image/*，避免Android端选不了 -->
					<vc-upload
						accept="image/gif,image/jpeg,image/jpg,image/png"
						v-bind="imageUploadOptions"
						:max="imageMax"
						@file-success="handleImgSuccess"
						@file-start="handleUploadStart"
						@file-error="(...args) => handleUploadError(args[0], 'image')"
						@error="(...args) => handleUploadError(args[0], 'image')"
						@complete="handleComplete"
					>
						<vc-icon type="image" style="font-size: 15px" @click="handleUploadImg" />
					</vc-upload>
				</button>
				<button class="vc-quill-editor__icon">
					<vc-upload
						accept="video/mp4,video/webm,video/ogg"
						v-bind="videoUploadOptions"
						:max="videoMax"
						:gallery="false" 
						@file-success="handleVideoSuccess"
						@file-start="handleUploadStart"
						@file-error="(...args) => handleUploadError(args[0], 'video')"
						@error="(...args) => handleUploadError(args[0], 'video')"
						@complete="handleComplete"
					>
						<vc-icon type="video" style="font-size: 16px" @click="handleUploadVideo" />
					</vc-upload>
				</button>
				<button class="vc-quill-editor__icon" @click="handleUndo">
					<vc-icon type="undo" style="font-size: 15px" />
				</button>
				<button class="vc-quill-editor__icon" @click="handleRedo">
					<vc-icon type="redo" style="font-size: 15px" />
				</button>
				<template #extend>
					<slot name="extend" />
				</template>
			</vc-editor-toolbar>
		</slot>
		<div ref="editorElement" />
		<div 
			v-show="isLoading"
			class="vc-quill-editor__spin"
		>
			<vc-spin />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, inject, computed, watch, reactive, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue';

import { getUid } from '../utils/utils';
import EditorToolbar from './toolbar';
import Upload from '../upload/index';
import Icon from '../icon/index';
import ImagePreview from '../image-preview/index';
import defaultOptions from './default-options';
import { VcInstance } from '../vc/index';
import { registVideoBlot } from './extends/video-blot';
import { registerLineHeight } from './extends/line-height';
import { registerLetterSpacing } from './extends/letter-spacing';
import ImageExtend from './extends/image-extend';
import Spin from '../spin';
import Message from '../message';

export default defineComponent({
	name: "vc-editor",
	components: {
		'vc-editor-toolbar': EditorToolbar,
		'vc-upload': Upload,
		'vc-icon': Icon,
		'vc-spin': Spin
	},
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		options: {
			type: Object,
			default() {
				return {
					modules: {
						toolbar: "#toolbar",
						// 必须要配置，否则该扩展不生效
						ImageExtend: {
							upload: {
								showTips: false,
								size: 10, // 单位：M
								max: 1,
								multiple: false
							}
						},
					}
				};
			}
		},
		disabled: {
			type: Boolean,
			default: false
		},
		imageUploadOptions: {
			type: Object,
			default: () => ({})
		},
		videoUploadOptions: {
			type: Object,
			default: () => ({})
		},
		gallery: {
			type: [Function, Boolean],
			default: true
		},
		// 注册扩展
		register: Function,
		videoPoster: [Function, Boolean],
		// 点击img元素是否可以进行预览，为false的时候会将光标聚焦到该元素后面
		preview: {
			type: Boolean,
			default: true
		}
	},
	emits: [
		'ready',
		'blur',
		'focus',
		'input',
		'update:modelValue',
		'change'
	],
	setup(props, { emit }) {
		const instance = getCurrentInstance();
		const formItem = inject('form-item', {});
		const editorElement = ref(null);
		const toolbar = ref(null);
		const content = ref('');
		const uid = ref(getUid('editor-toolbar'));
		const isLoading = ref(false);
		const videoMax = ref(props.videoUploadOptions.max || Number.MAX_SAFE_INTEGER);
		const imageMax = ref(props.imageUploadOptions.max || Number.MAX_SAFE_INTEGER);

		const editor = shallowRef(null);
		// 保存点击图片失焦时光标位置
		const selectionIndex = ref(0);

		let ImageBlot;
		let Parchment;
		const currentOptions = computed(() => {
			const { Editor = {} } = VcInstance.config || {};
			return {
				...(Editor.options || {}),
				...props.options,
				modules: {
					...((Editor.options || {}).modules || {}),
					...props.options.modules,
					toolbar: `#${uid.value}`
				}
			};
		});

		watch(
			() => props.disabled,
			(v) => {
				if (editor.value) {
					editor.value.enable(!v);
				}
			}
		);

		watch(
			() => props.modelValue,
			(v) => {
				if (editor.value) {
					if (v && v !== content.value) {
						content.value = v;
						editor.value.clipboard.dangerouslyPasteHTML(v);
					} else if (!v) {
						editor.value.setText('');
					}
				}
			}
		);
		let Quill;

		const getImgs = () => {
			let imgs = [];
			let deltas = editor.value.getContents().ops || [];

			for (let i = 0; i < deltas.length; i++) {
				if (deltas[i].insert.image) {
					imgs.push({
						src: deltas[i].insert.image,
						thumbnail: deltas[i].insert.image + '!4-4',
						title: 'Image' + (i + 1),
						w: 1200,
						h: 900
					});
				}
			}
			return imgs;
		};

		const updateMax = () => {
			const $content = editor.value.getContents().ops || [];
			let videoNum = 0;
			let imgNum = 0;
			$content.map((it) => {
				const insertEl = it.insert || {};
				if (insertEl.hasOwnProperty('vc-video')) { // eslint-disable-line
					videoNum++;
				} else if (insertEl.hasOwnProperty('image')) { // eslint-disable-line
					imgNum++;
				}
				return it;
			});
			videoMax.value = (props.videoUploadOptions.max || Number.MAX_SAFE_INTEGER) - videoNum;
			imageMax.value = (props.imageUploadOptions.max || Number.MAX_SAFE_INTEGER) - imgNum;
		};

		const _register = () => {
			let lineHeight;
			let letterSpacing;

			if (toolbar.value) {
				lineHeight = toolbar.value.lineHeight;
				letterSpacing = toolbar.value.letterSpacing;
			}
			Quill.register('modules/ImageExtend', ImageExtend);
			registVideoBlot(Quill);
			registerLineHeight(Quill, lineHeight);
			registerLetterSpacing(Quill, letterSpacing);
			props.register?.(Quill);
		};

		const initFontSize = () => {
			let fontSize = toolbar.value ? toolbar.value.fontSize : ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '50px'];
			let $Parchment = Quill.import('parchment');
			let SizeClass = new $Parchment.Attributor.Class('size', 'ql-size', {
				scope: $Parchment.Scope.INLINE,
				whitelist: fontSize
			});
			let SizeStyle = new $Parchment.Attributor.Style('size', 'font-size', {
				scope: $Parchment.Scope.INLINE,
				whitelist: fontSize
			});
			Quill.register({
				'attributors/class/size': SizeClass,
				'attributors/style/size': SizeStyle
			}, true); // true 表示要覆盖已有的配置
			Quill.register({
				'formats/size': SizeClass,
			}, true);
		};

		const getLength = () => {
			let selection = editor.value.getSelection();
			return selection ? selection.index : (selectionIndex.value || editor.value.getLength());
		};
		const handleImgSuccess = (res) => {
			// 获取光标所在位置
			let length = getLength();
			editor.value.insertEmbed(length, 'image', res.data.url);
			// 光标向后移动一位
			editor.value.setSelection(length + 1);
		};

		const handleVideoSuccess = (res) => {
			let length = getLength();
			const attrs = {
				url: res.data.url,
				controls: 'controls',
				style: "max-width: 100%",
				width: 'auto',
				height: 'auto',
			};
			if (typeof props.videoPoster === 'function') {
				attrs.poster = props.videoPoster(res.data.url);
			}
			editor.value.insertEmbed(length, 'vc-video', attrs);
			// 光标向后移动一位
			editor.value.insertText(length + 1, '');
			editor.value.setSelection(length + 2);
		};

		const handleUploadStart = () => {
			isLoading.value = true;
		};

		const handleUploadError = (e, type) => {
			if (type === 'image' && imageMax.value === 0) {
				Message.error(`图片最多上传${props.imageUploadOptions.max}张`);
			} else if (type === 'video' && videoMax.value === 0) {
				Message.error(`视频最多上传${props.videoUploadOptions.max}个`);
			} else {
				Message.error(e.msg || '网络错误');
			}
		};

		const handleComplete = () => {
			isLoading.value = false;
		};

		const handlePreview = (e) => {
			if (props.preview) {
				let image = Parchment.find(e.target);
				if (image instanceof ImageBlot) {
					let index;
					let imgs = Array.from(document.querySelectorAll('.ql-container img'));
					let imgSource = imgs.map((it, idx) => {
						it === e.target && (index = idx);
						return it.src;
					});

					let pos = {};
					try {
						const target = e.target; // 先得到pos, 否则getThumbBoundsFn再计划，target已变化（比如弹窗transition的影响）
						const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
						const rect = target.getBoundingClientRect();

						pos = { x: rect.left, y: rect.top + pageYScroll, w: rect.width };

					} catch (error) {
						// console.log(e);
					}

					ImagePreview.open({
						visible: true,
						dataSource: imgSource,
						options: {
							index,
							history: false,
							getThumbBoundsFn: () => pos
						}
					});
				}
			} else if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
				// 图片和视频被点击时，将光标聚焦到该元素后面
				const sele = window.getSelection();
				const range = document.createRange();
				const parent = e.target.parentNode;
				const offset = Array.prototype.indexOf.call(parent.childNodes, e.target) + 1;
				range.setStart(parent, offset);
				range.setEnd(parent, offset);
				sele.removeAllRanges();
				sele.addRange(range);
			}
		};

		
		const handleUploadImg = (e) => {
			const { UploadPicker = {} } = VcInstance.config;
			if (
				typeof props.gallery === 'function' 
				|| (props.gallery && (UploadPicker.gallery))
			) {
				let fn = typeof props.gallery === 'function' 
					? props.gallery
					: (UploadPicker.gallery);
					
				fn(instance, 'image') && e.stopPropagation();
			} 
			selectionIndex.value = getLength(); // 存储失焦时光标位置
		};

		const handleUploadVideo = (e) => {
			const { UploadPicker = {} } = VcInstance.config;
			if (typeof props.gallery === 'function' || (props.gallery && UploadPicker.gallery)) {
				let fn = typeof props.gallery === 'function' ? props.gallery : UploadPicker.gallery;
					
				fn(props, 'video') && e.stopPropagation();
			} 
			selectionIndex.value = props.getLength(); // 存储失焦时光标位置
		};

		const handleUndo = () => {
			editor.value.history.undo();
		};

		const handleRedo = () => {
			editor.value.history.redo();
		};


		const initListener = () => {
			ImageBlot = Quill.import('formats/image');
			Parchment = Quill.import('parchment');
			editor.value.root.addEventListener('click', handlePreview);
		};

		const removeListener = () => {
			editor.value.root.removeEventListener('click', handlePreview);
		};

		const init = () => {
			_register();
			initFontSize();
			editor.value = new Quill(editorElement.value, { ...defaultOptions, ...currentOptions.value });
			
			editor.value.enable(!props.disabled);
			if (props.modelValue) {
				editor.value.setText('');
				editor.value.clipboard.dangerouslyPasteHTML(props.modelValue);
				let length = editor.value.getLength();
				editor.value.setSelection(length + 1); // 光标位置
			}
			
			editor.value.on('selection-change', range => {
				if (!range) {
					emit('blur', editor.value);
				} else {
					emit('focus', editor.value);
				}
			});

			// 监听文本内容变化
			editor.value.on('text-change', (delta, oldDelta, source) => {
				let html = editorElement.value.children[0].innerHTML;
				const text = editor.value.getText();
				const isDelete = ((delta.ops || []).pop() || {}).delete;
				updateMax(); 	
				if (html === '<p><br></p>') html = '';
				content.value = html;
				emit('input', content.value);
				emit('update:modelValue', content.value);
				emit('change', { html, text, editor: editor.value });
				formItem?.change?.(content.value);
			});
		};

		// 跟imgs-picker 对外暴露的增加方法保持同名
		const add = (source = [], type = 'image') => {
			const fn = type === 'video' ? handleVideoSuccess : handleImgSuccess;
			source.forEach(item => {
				fn({ data: { url: item } });
			});
		};

		onMounted(async () => {
			let $Quill = window.Quill || await import('quill');
			// 兼容webpack 3.0/4.0 写法
			Quill = $Quill.default ? $Quill.default : $Quill;

			init();
			initListener();
			emit('ready', { dependencies: { quill: Quill } });
		});

		onBeforeUnmount(() => {
			removeListener();
			editor.value = null;
		});

		return {
			editorElement,
			toolbar,
			content,
			uid,
			isLoading,
			videoMax,
			imageMax,
			selectionIndex,

			handleImgSuccess,
			handleUploadStart,
			handleUploadError,
			handleComplete,
			handleUploadImg,
			handleVideoSuccess,
			handleUploadVideo,
			handleUndo,
			handleRedo
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';

$block: vc-quill-editor;

@include block($block) {
	position: relative;
	color: #333 !important;
	display: flex;
	flex-direction: column;
	@include element(icon) {
		outline: none; 
		line-height: 1;
	}
	@include element(spin) {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ffffffaa
	}
	.ql-container {
		flex: 1;
		overflow: auto;
	}
}
</style>
