<template>
	<canvas :width="width" :height="height" />
</template>
<script lang="ts">
import { defineComponent, watch, onMounted, getCurrentInstance } from 'vue';
import Processing from './core';

export default defineComponent({
	name: "vc-imgs-processing",
	props: {
		// 要处理的图片可以是图片网络地址，imageData, canvas
		dataSource: [String],
		// 画布的宽度
		width: {
			type: Number,
			default: 100
		}, 
		// 画布的高度
		height: {
			type: Number,
			default: 100
		},
		// 图像的处理方法
		processing: {
			type: [String, Function],
			required: true,
			validator: (v) => {
				if (typeof v === 'string') {
					return ['cutout', 'gray'].includes(v);
				}
				return true;
			}
		},
		// 要扣掉的颜色rgba格式
		cutoutColor: {
			type: Array,
			default: () => ([0, 0, 0, 1])
		},
		// 颜色的容差
		tolerance: {
			type: Number,
			default: 0
		},
		crossOrigin: {
			type: String,
			default: 'anonymous'
		}
	},
	setup(props) {
		const instance = getCurrentInstance();

		const processImage = async () => {
			let context = instance.vnode.el.getContext('2d');
			let afterData;
			const imageData = await Processing.getImageData({
				context, 
				dataSource: props.dataSource,
				width: props.width,
				height: props.height,
				crossOrigin: props.crossOrigin
			});

			if (typeof props.processing === 'string') {
				afterData = Processing[props.processing](
					imageData, 
					{
						cutoutColor: props.cutoutColor, 
						tolerance: props.tolerance
					}
				);
			} else {
				afterData = props.processing(props.imageData);
			}
			context.putImageData(afterData, 0, 0);
		};

		watch(
			() => props.dataSource,
			processImage
		);
		onMounted(processImage);

		return;
	}
});
</script>
