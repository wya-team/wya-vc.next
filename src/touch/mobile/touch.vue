<template>
	<component 
		:is="tag"
		@touchstart="handleStart"
		@touchmove="handleMove"
		@touchend="handleEnd"
	>
		<slot />
	</component>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

const getTime = () => {
	return new Date().getTime(); 
};
const getDistance = (xLen, yLen) => {
	return Math.sqrt(xLen * xLen + yLen * yLen);
};
/**
 * 获取向量的旋转方向
 */
const getRotateDirection = (vector1, vector2) => {
	return vector1.x * vector2.y - vector2.x * vector1.y;
};

const getRotateAngle = (vector1, vector2) => {
	let direction = getRotateDirection(vector1, vector2);
	direction = direction > 0 ? -1 : 1;
	let len1 = getDistance(vector1.x, vector1.y);
	let len2 = getDistance(vector2.x, vector2.y);
	let mr = len1 * len2;
	if (mr === 0) return 0;
	let dot = vector1.x * vector2.x + vector1.y * vector2.y;
	let r = dot / mr;
	if (r > 1) r = 1;
	if (r < -1) r = -1;
	return (Math.acos(r) * direction * 180) / Math.PI;
};

export default defineComponent({
	name: "vcm-touch",
	props: {
		tag: {
			type: String,
			default: 'div'
		},
		flickThreshold: {
			type: Number,
			default: 0.6
		},
		prevent: {
			type: Boolean,
			default: true
		}
	},

	emits: [
		'tap',
		'long-tap',
		'double-tap',
		'pinch',
		'pinch',
		'rotate',
		'move',
		'swipe',
		'swipe-left',
		'swipe-right',
		'swipe-up',
		'swipe-down'
	],
	setup(props, { emit }) {
		let startX = null;
		let startY = null;
		let startTime = null;
		let moveX = null;
		let moveY = null;
		let previousPinchScale = 1;
		let previousTouchPoint = null;
		let previousTouchDistance = 0;
		let previousTouchTime = 0;
		let longTapTimeout = null;

		let maxTapAbsX = 60;
		let maxTapAbsY = 60;
		let touchVector = null;

		const setDefault = () => {
			previousPinchScale = 1;
		};

		const handleStart = (e) => {
			let point = e.touches ? e.touches[0] : e;
			startX = point.pageX;
			startY = point.pageY;
			clearTimeout(longTapTimeout);
			startTime = getTime();
			// 两点接触
			if (e.touches.length > 1) {
				let point2 = e.touches[1];
				let xLen = Math.abs(point2.pageX - startX);
				let yLen = Math.abs(point2.pageY - startY);
				previousTouchDistance = getDistance(xLen, yLen); 
				touchVector = {
					x: point2.pageX - startX,
					y: point2.pageY - startY
				};
			} else {
				longTapTimeout = setTimeout(() => {
					emit('long-tap', e);
				}, 800);
				if (previousTouchPoint) {
					if (Math.abs(startX - previousTouchPoint.startX) < maxTapAbsX 
						&& Math.abs(startY - previousTouchPoint.startY) < maxTapAbsY 
						&& Math.abs(startTime - previousTouchTime) < 300
					) {
						emit('double-tap', e);
					}
				}
				previousTouchTime = startTime;
				previousTouchPoint = {
					startX,
					startY
				};
			}
		};

		const handleMove = (e) => {
			props.prevent && e.preventDefault();

			let timestamp = getTime();

			if (e.touches.length > 1) {
				let xLen = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
				let yLen = Math.abs(e.touches[0].pageY - e.touches[1].pageY);
				let touchDistance = getDistance(xLen, yLen);
				// 缩放
				if (previousTouchDistance) {
					let pinchScale;
					if (touchDistance > previousTouchDistance) { // 放大
						pinchScale = touchDistance / previousTouchDistance;
						emit('pinch', {
							scale: pinchScale - previousPinchScale,
						});
					} else { // 缩小
						pinchScale = previousTouchDistance / touchDistance;
						emit('pinch', {
							scale: previousPinchScale - pinchScale,
						});
					}
					previousPinchScale = pinchScale;
				}
				// 旋转
				if (touchVector) {
					let vector = {
						x: e.touches[1].pageX - e.touches[0].pageX,
						y: e.touches[1].pageY - e.touches[0].pageY
					};
					let angle = getRotateAngle(vector, touchVector);
					emit('rotate', { angle });
					touchVector.x = vector.x;
					touchVector.y = vector.y;
				}
			} else {
				clearTimeout(longTapTimeout);
				let point = e.touches ? e.touches[0] : e;
				let deltaX = moveX === null ? 0 : point.pageX - moveX;
				let deltaY = moveY === null ? 0 : point.pageY - moveY;
				
				emit('move', {
					deltaX,
					deltaY
				});
				moveX = point.pageX;
				moveY = point.pageY;
			}
		};

		const handleEnd = (e) => {
			/**
			 * 在X轴或Y轴发生过移动
			 */
			clearTimeout(longTapTimeout);
			let isDouble = e.changedTouches.length > 1;
			let timestamp = getTime();
			let absX = Math.abs(moveX - startX);
			let deltaX = moveX - startX;
			let absY = Math.abs(moveY - startY);
			let deltaY = moveY - startY;
			/**
			 * 每毫秒的运动轨迹px/ms*1000
			 * 默认要1秒超过600像素
			 */
			let time = timestamp - startTime;
			let velocity = getDistance(absX, absY) / time;
			let isFlick = velocity > props.flickThreshold;
			// 在x轴滑动大于maxTapAbsX ， Y轴下于maxTapAbsY 视为滑动
			if (((moveX !== null && absX > maxTapAbsX) || (moveY !== null && absY > maxTapAbsY)) && !isDouble && isFlick) {
				emit('swipe', { deltaX, deltaY, isFlick });
				if (absX > absY) {
					if (deltaX > 0) {
						emit('swipe-left', { deltaX, isFlick });
					} else {
						emit('swipe-right', { deltaX, isFlick });
					}
				} else if (deltaY > 0) {
					emit('swipe-up', { deltaY, isFlick });
				} else {
					emit('swipe-down', { deltaY, isFlick });
				}

			} else if (timestamp - startTime < 2000) {
				if (timestamp - startTime < 500) {
					emit('tap', e);
				}
				if (timestamp - startTime > 500) {
				 // emit('long-tap', e);
				}
			}

			startX = null;
			startY = null;
			moveX = null;
			moveY = null;
			previousPinchScale = 1;
		};

		const handleCancel = (e) => {
			handleEnd();
		};

		return {
			handleStart,
			handleMove,
			handleEnd
		};
	}
});
</script>
<style></style>