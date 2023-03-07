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
			<vc-customer 
				:render="render" 
				:status="status" 
				type="DOWN"
			/>
		</div>
		<div 
			:style="[yStyle]"
			class="vc-recycle-list__container"
		>
			<slot />
		</div>
		<!-- TODO: 上拉刷新（inverted的情况下）, 场景不多，暂不考虑 -->
		<!-- <div 
			v-if="inverted && pullable" 
			:style="[yStyle]"
			class="vc-recycle-list__pull"
		>
			<vc-customer 
				:render="render" 
				:status="status" 
				type="UP"
			/>
		</div> -->
	</div>
</template>
<script lang="ts">
import { ref, computed, defineComponent, getCurrentInstance } from 'vue';
import Customer from '../customer';

const DEFAULT = 1;
const PULL = 2;
const PENDING = 3;
const REFRESH = 4;

const STATUS_MAP = {
	DOWN: {
		[DEFAULT]: '~', 
		[PULL]: '↓ 下拉刷新', 
		[PENDING]: '↑ 释放更新', 
		[REFRESH]: '加载中...',
	},
	UP: {
		[DEFAULT]: '~', 
		[PULL]: '↑ 上拉刷新', 
		[PENDING]: '↓ 释放更新', 
		[REFRESH]: '加载中...', 
	}
};

export default defineComponent({
	name: 'vc-recycle-list-pull-container',
	components: {
		'vc-customer': Customer
	},
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
		},
		render: {
			type: Function,
			default: ({ status, type }) => STATUS_MAP[type][status]
		}
	},
	emits: ['refresh'],
	setup(props, { slots, emit }) {
		const instance = getCurrentInstance();
		const current = ref();
		const y = ref(0);
		const status = ref(0);

		const yStyle = computed(() => {
			if (props.inverted || !props.pullable) return;

			return {
				transform: `translateY(${y.value}px)`
			};
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
				if (status.value == REFRESH) return;
				if (y.value <= props.pauseY) {
					status.value = PULL;
				} else {
					status.value = PENDING;
				}
			}
		};

		const handleEnd = async (e) => {
			if (!isStart || props.inverted || !props.pullable) return;
			if (!('ontouchend' in window) || !e.targetTouches.length) {
				isStart = false;

				startY = 0;
				if (status.value == PENDING) {
					status.value = REFRESH;
					y.value = props.pauseY;
					try {
						await instance.vnode.props.onRefresh();
					} finally {
						status.value = DEFAULT;
						y.value = 0;
					}
				} else if (status.value == REFRESH) {
					y.value = props.pauseY;
				} else {
					y.value = 0;
					status.value = DEFAULT;
				}
			}
		};

		return {
			current,
			status,
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
