<template>
	<div ref="target">
		<slot />
	</div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Utils } from '@wya/utils';
import { isDataURL } from '../utils/utils';

import { VcInstance, VcError } from '../vc/index';

export default {
	name: "vc-html-img",
	props: {
		// useCORS
		crossOrigin: {
			type: String,
			// ''. 'anonymous', 'use-credentials'
			default: 'anonymous',
			validator: v => /^(|anonymous|use-credentials)$/.test(v),
		},
		parser: {
			type: Function
		},
		// 传递给html2canvas的配置项
		options: {
			type: Object,
			default: () => ({})
		}
	},
	emits: ['ready'],
	setup(props, { emit }) {
		const target = ref(null);
		/**
		 * 网络的图片如果没有加上crossOrigin，且没有放在第一个就会出现问题（Safari）
		 */
		const loadImageURL = () => {
			let { parser } = VcInstance.config.HtmlImage || {};

			parser = props.parser || parser || (() => false);

			return Promise.all([...target.value.querySelectorAll('img')].map((node) => {
				return new Promise((resolve, reject) => {
					(async () => {
						// 解析图片，如将base64图片先上传再显示（iOS 10.2 存在无法转化的情况）
						let url = node.src;
						try {
							url = await parser(node.src) || url;
						} catch (e) {
							console.error(e);
						}

						if (isDataURL(url)) { // data: base64
							resolve();
							return;
						}

						let img = new Image();
						img.crossOrigin = props.crossOrigin;
						img.src = `${url}?=${new Date().getTime()}`; // 强制不缓存
						img.onload = () => {
							node.src = img.src;
							resolve();
						};
						img.onerror = () => {
							// 打印不了该图片
							resolve();
						};
					})();
				});
			}));
		};

		const getImage = async (opts = {}) => {
			const { filename = 'image', getFile = true, ...imageOptions } = opts;
			try {
				let html2canvas = window.html2canvas || await import('html2canvas');
				// 兼容webpack 3.0/4.0 写法
				html2canvas = html2canvas.default ? html2canvas.default : html2canvas;

				emit('ready', {
					dependencies: {
						html2canvas
					}
				});

				// 处理跨域兼容
				props.crossOrigin && await loadImageURL();

				const canvas = await html2canvas(target.value, { 
					allowTaint: false, 
					useCORS: true,
					...props.options,
					...(imageOptions || {})
				});

				const { file, base64Image } = await Utils.canvas2file(canvas, { filename, getFile });

				return {
					file,
					base64Image
				};
			} catch (e) {
				throw new VcError('html-img', e);
			}
		};

		const download = async (opts = {}) => {
			const { filename = 'image', getFile = true } = opts;
			try {
				const { file, base64Image } = await getImage({ filename, getFile });

				let $this = document.createElement('a');
				// initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
				let evt = document.createEvent("HTMLEvents");
				evt.initEvent("click", true, true);
				// load
				$this.download = filename;
				$this.href = URL.createObjectURL(file);
				$this.click();
				return {
					file,
					base64Image
				};
			} catch (e) {
				throw new VcError('html-img', e);
			}
		};

		return {
			target,
			getImage,
			download
		};
	}
};
</script>
