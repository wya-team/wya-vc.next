<template>
	<vcm-touch
		@tap="handleTap"
		@double-tap="handleDoubleTap"
		@long-tap="handleLongTap"
		@swipe="handleSwipe"
		@swipe-up="handleSwipeUp"
		@swipe-right="handleSwipeRight"
		@swipe-down="handleSwipeDown"
		@swipeLeft="handleSwipeLeft"
		@move="handleMove"
		@pinch="handlePinch"
		@rotate="handleRotate"
	>
		<div :style="transform" style="background: 'red'; height: 100vh; display: flex; align-items: center; justify-content: center">
			{{ eventType }} {{ angle }}
		</div>
	</vcm-touch>
</template>
<script>
import { defineComponent, ref, computed } from 'vue';
import Mtouch from '../index.m';

export default defineComponent({
	name: "vcm-touch-basic",
	components: {
		'vcm-touch': Mtouch
	},
	setup(props) {
		const eventType = ref("单机，双击，长按，滑动，上滑，下滑，左滑，右滑，旋转，缩放");
		const scale = ref(1);
		const angle = ref(0);

		const transform = computed(() => {
			return {
				transform: `scale(${scale.value}) rotate(${angle.value}deg)`
			};
		});

		return {
			eventType,
			scale,
			angle,
			transform,

			/**
			 * 单击执行
			 */
			handleTap(e) {
				eventType.value = "单机";
			},
			/**
			 * 双击执行
			 */
			handleDoubleTap(e) {
				eventType.value = "双击";
			},
			/**
			 * 长按执行
			 */
			handleLongTap(e) {
				eventType.value = "长按";
			},
			/**
			 * 只要滑动都会执行
			 */
			handleSwipe(e) {
				eventType.value = "只要滑动都会执行";
			},
			/**
			 * 上滑
			 */
			handleSwipeUp(e) {
				eventType.value = "上滑";
			},
			/**
			 * 右滑
			 */
			handleSwipeRight(e) {
				eventType.value = "右滑";
			},
			/**
			 * 下滑
			 */
			handleSwipeDown(e) {
				eventType.value = "下滑";
			},
			/**
			 * 左滑
			 */
			handleSwipeLeft(e) {
				eventType.value = "左滑";
			},
			/**
			 * 滑动执行的函数
			 */
			handleMove(e) {

			},
			/**
			 * 缩放
			 */
			handlePinch({ scale: $scale }) {
				eventType.value = "缩放";
				scale.value += $scale;
			},
			/**
			 * 旋转
			 */
			handleRotate({ $angle }) {
				eventType.value = "旋转";
				angle.value += $angle;
			}
		};
	}
});
</script>
