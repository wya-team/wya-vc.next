<template>
	<div 
		ref="current"
		@mousedown="handleStart"
		@mousemove="handleMove"
		@mouseup="handleEnd"
		@touchstart="handleStart"
		@touchmove="handleMove"
		@touchend="handleEnd"
	>
		<div 
			v-if="!inverted && pullable" 
			:style="[yStyle]"
			class="vc-recycle-list__pull"
		>
			<span>{{ stateText }}</span>
		</div>
		<div 
			:style="[yStyle]"
			class="vc-recycle-list__container"
		>
			<slot />
		</div>
	</div>
</template>
<script lang="ts">
import { ref, computed, defineComponent, getCurrentInstance } from 'vue';

export default defineComponent({
	name: 'vc-recycle-list-pull-container',
	props: {
		inverted: {
			type: Boolean,
			default: false
		},

		pullable: {
			type: Boolean,
			default: false
		},
			
		pauseY: {
			type: Number,
			default: 30
		}
	},
	emits: ['refresh'],
	setup(props, { slots, emit }) {
		const instance = getCurrentInstance();
		const current = ref();
		const y = ref(0);
		const status = ref(0);

		const STATUS_MAP = {
			0: '~', 
			1: '↓ 下拉刷新', 
			2: '↑ 释放更新', 
			3: '加载中...', 
		};

		const yStyle = computed(() => {
			if (props.inverted || !props.pullable) return;

			return {
				transform: `translateY(${y.value}px)`
			};
		});

		const stateText = computed(() => {
			return STATUS_MAP[status.value];
		});

		let startY = 0;
		let isStart = false;

		// TODO: 多个手指同时触发拉动
		const handleStart = (e) => {
			if (props.inverted || !props.pullable) return;

			isStart = true;

			if (!startY) {
				startY = e.touches 
					? e.touches[0].screenY 
					: e.screenY;	
			}
		};

		const handleMove = (e) => {
			if (!isStart || props.inverted || !props.pullable) return;
			const allow = current.value.querySelector('.vc-recycle-list__wrapper').scrollTop == 0;
			if (!allow) return;

			const moveY = e.touches 
				? e.touches[0].screenY 
				: e.screenY;

			const distanceY = moveY - startY;
			if (
				distanceY > 0
				&& e.cancelable
			) {
				e.preventDefault();
				y.value = distanceY < props.pauseY * 3 ? distanceY : props.pauseY * 3 + (distanceY - props.pauseY * 3) / 5;
				if (status.value == 3) return;
				if (y.value <= props.pauseY) {
					status.value = 1;
				} else {
					status.value = 2;
				}
			}
		};

		const handleEnd = async (e) => {
			if (!isStart || props.inverted || !props.pullable) return;
			if (!('ontouchend' in window) || !e.targetTouches.length) {
				isStart = false;

				startY = 0;
				if (status.value == 2) {
					status.value = 3;
					y.value = props.pauseY;
					try {
						await instance.vnode.props.onRefresh();
					} finally {
						status.value = 0;
						y.value = 0;
					}
				} else if (status.value == 3) {
					y.value = props.pauseY;
				} else {
					y.value = 0;
					status.value = 0;
				}
			}
		};

		return {
			current,
			stateText,
			yStyle,
			handleStart,
			handleMove,
			handleEnd
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-recycle-list;

@include block($block) {
	position: relative;
	overflow: hidden; /* 配合vc-scroller让window系统下滚动时，不出现滚动条*/
	@include element(container) {
		height: 100%;
		transition: transform 300ms ease-out;
	}

	@include element(pull) {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		line-height: 30px;
		margin-top: -30px;
		transition: transform 300ms ease-out
	}
}
</style>
