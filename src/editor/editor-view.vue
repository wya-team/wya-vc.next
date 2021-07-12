<template>
	<div class="vc-quilleditor-view ql-snow">
		<div class="ql-editor" v-html="content" />
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue';
import { Load } from '@wya/utils';
import { getUid } from '../utils/utils';
import { lineHeight, letterSpacing } from './constant';
import ImagePreview from '../image-preview/index';
import { insertFontStyle, insertLineHeightStyle, insertLetterSpacingStyle } from './utils';
	
const setImages = (content) => {
	if (!content) return;
	/* eslint-disable */
	const IMG_REGX = /<img.*?(?:>|\/>)/gi;
	const SRC_REGX = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
	/* eslint-enable */

	let imgs = content.match(IMG_REGX);
	if (imgs) {
		let imgUrls = [];
		for (let i = 0; i < imgs.length; i++) {
			let src = imgs[i].match(SRC_REGX);
			// 获取图片地址
			src[1] && imgUrls.push(src[1]);
		}
		return imgUrls;
	}

	return;
};
export default defineComponent({
	name: 'vc-editor-view',
	props: {
		content: {
			type: String,
			default: ""
		},
		fontSize: {
			type: Array,
			default: () => ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '50px']
		},
		lineHeight: {
			type: Array,
			default: () => lineHeight
		},
		letterSpacing: {
			type: Array,
			default: () => letterSpacing
		},
	},

	setup(props) {
		const styleId = getUid('editor-view-style');
		const lineHeightStyleId = getUid('editor-toolbar-style');
		const letterSpacingStyleId = getUid('editor-toolbar-style');
		let images = [];

		const handlePreview = (e, idx) => {
			let pos = {};
			try {
				const target = e.target; 
				const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
				const rect = target.getBoundingClientRect();
				pos = { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
			} catch (error) {
				console.log(error);
			}

			ImagePreview.open({
				visible: true,
				dataSource: images,
				options: {
					index: idx,
					history: false,
					getThumbBoundsFn: (index) => pos
				}
			});
		};

		const initListener = () => {
			let dom = document.getElementsByClassName('ql-editor');
			Array.from(dom).forEach(it => {
				if (it.parentNode.className.indexOf('vc-quilleditor-view ql-snow') !== -1) {
					it.addEventListener('click', (e) => {
						if (e.target.nodeName === 'IMG') {
							let index = (images).indexOf(e.target.currentSrc);
							handlePreview(e, index);
						}
					});
				}
			});
		};

		watch(
			() => props.content,
			() => {
				images = setImages() || [];
			},
			{ immediate: true }
		);

		onMounted(() => {
			insertFontStyle(props.fontSize, styleId);
			insertLineHeightStyle(props.lineHeight.map((it) => String(it * 10)), lineHeightStyleId); // 设置的样式1.2为class不起由于有.不生效, 默认扩大十倍，样式再除以10
			insertLetterSpacingStyle(props.letterSpacing, letterSpacingStyleId);

			initListener();
		});

		onUnmounted(() => {
			Load.removeCSSCode(styleId);
			Load.removeCSSCode(lineHeightStyleId);
			Load.removeCSSCode(letterSpacingStyleId);
		});
	}
});
</script>
