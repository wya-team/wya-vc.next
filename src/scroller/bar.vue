<template>
	<vc-transition-fade>
		<div
			v-show="thumbSize && (always || isVisible)"
			ref="track"
			:style="trackStyle"
			:class="[trackClassName, 'is-' + barOptions.key]"
			class="vc-scroller-bar__track"
			@mousedown="handleClickTrack"
		>
			<div
				ref="thumb"
				:class="thumbClassName"
				:style="[thumbStyle, thumbCalcStyle]"
				class="vc-scroller-bar__thumb"
				@mousedown="handleClickThumb"
			/>
		</div>
	</vc-transition-fade>
</template>

<script lang="ts">
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { $ } from '@wya/utils';
import { TRANSFORM, raf } from '../utils';
import Transition from '../transition';

const BAR_MAP = {
	vertical: {
		scroll: 'scrollTop',
		size: 'height',
		key: 'vertical',
		axis: 'Y',
		client: 'clientY',
		direction: 'top',
	},
	horizontal: {
		scroll: 'scrollLeft',
		size: 'width',
		key: 'horizontal',
		axis: 'X',
		client: 'clientX',
		direction: 'left',
	}
};

export default defineComponent({
	name: 'vc-scroller-bar',
	components: {
		'vc-transition-fade': Transition.Fade
	},
	props: {
		vertical: Boolean,
		wrapperSize: Number,
		contentSize: Number,
		scrollOffset: Number, // content的滚动距离
		always: {
			type: Boolean,
			default: false,
		},
		// 最小的thumb值
		thumbMinSize: {
			type: Number,
			default: 30
		},
		thumbStyle: [Object, String, Array],
		thumbClassName: [Object, String, Array],
		trackStyle: [Object, String, Array],
		trackClassName: [Object, String, Array],
		// 轨道偏移值（头尾）
		trackOffset: {
			type: Array,
			default: () => ([0, 0])
		}
	},
	setup(props) {
		const parent = inject('scroller', {});
		const { wrapper, content } = parent;

		const track = ref(null);
		const thumb = ref(null);
		const cursorDown = ref(null);
		const cursorLeave = ref(null);
		const isVisible = ref(false);
		const barOptions = computed(() => BAR_MAP[props.vertical ? 'vertical' : 'horizontal']);

		// 左右距离
		const trackOffsetSum = computed(() => {
			return props.trackOffset[0] + props.trackOffset[1];
		});

		// 滚动条的实际容器大小
		const wrapperFitSize = computed(() => {
			return props.wrapperSize - trackOffsetSum.value;
		});

		// thumb的大小
		const thumbSize = computed(() => {
			const size = wrapperFitSize.value * (props.wrapperSize / props.contentSize);
			return size && size < wrapperFitSize.value ? size : 0;
		});

		const thumbFitSize = computed(() => {
			return Math.max(thumbSize.value, props.thumbMinSize);
		});

		// 最大可移动的距离
		const maxMove = computed(() => {
			return wrapperFitSize.value - thumbSize.value;
		});

		// 滚动时均摊Size
		const averageSize = computed(() => {
			return (Math.max(props.thumbMinSize - thumbSize.value, 0)) / maxMove.value;
		});

		// thumb偏移值
		const thumbMove = computed(() => {
			// thumb应该在当前bar上的偏移值
			const currentMove = (props.scrollOffset / props.wrapperSize) * thumbSize.value;
			// 当前你滚动的距离
			const thumbFitMove = currentMove * (1 - averageSize.value); 
			return thumbFitMove > maxMove.value ? maxMove.value : thumbFitMove;
		});

		// thumb样式
		const thumbCalcStyle = computed(() => {
			const { size } = barOptions.value;
			return {
				[size]: thumbFitSize.value + 'px',
				// [TRANSFORM]: `translate${barOptions.value.axis}(${thumbMove.value}px)`
			};
		});

		let originalOnselectstart = null;
		let startMove;
		let startThumbMove;
		const setScroll = (thumbFitMove) => {
			const { scroll } = barOptions.value;
			const scrollOffset = ((thumbFitMove / (1 - averageSize.value)) / thumbSize.value) * props.wrapperSize;

			wrapper.value[scroll] = scrollOffset;
			parent.refreshScroll();
		};

		const handleMouseMoveDocument = (e) => {
			if (cursorDown.value === false) return;
			if (!startMove) return;

			const { axis, direction, client, scroll } = barOptions.value;

			const thumbFitMove = Math.min(
				Math.max(0, startThumbMove + e[client] - startMove),
				maxMove.value
			);

			setScroll(thumbFitMove);
		};

		const handleMouseUpDocument = () => {
			cursorDown.value = false;
			startMove = 0;

			$(document).off('mousemove', handleMouseMoveDocument);
			$(document).off('mouseup', handleMouseUpDocument);

			document.onselectstart = originalOnselectstart;
			if (cursorLeave.value) {
				isVisible.value = false;
			}
		};

		const startDrag = (e) => {
			e.stopImmediatePropagation();
			cursorDown.value = true;

			$(document).on('mousemove', handleMouseMoveDocument);
			$(document).on('mouseup', handleMouseUpDocument);

			originalOnselectstart = document.onselectstart;
			document.onselectstart = () => false;
		};

		/**
		 * 拖动
		 */
		const handleClickThumb = (e) => {
			// 防止中右键点击事件
			e.stopPropagation();
			if (e.ctrlKey || [1, 2].includes(e.button)) {
				return;
			}

			window.getSelection().removeAllRanges();

			startDrag(e);

			const { client, direction, axis } = barOptions.value;
			
			startMove = e[client];
			startThumbMove = thumbMove.value;
		};

		/**
		 * 点击滚动轴
		 */
		const handleClickTrack = (e) => {
			const { client, direction, scroll } = barOptions.value;
			const thumbFitMove = e[client] - e.target.getBoundingClientRect()[direction] - thumbFitSize.value / 2;

			setScroll(thumbFitMove);
		};

		const handleMouseMove = () => {
			cursorLeave.value = false;
			isVisible.value = !!thumbSize.value;
		};

		const handleLeave = () => {
			cursorLeave.value = true;
			isVisible.value = cursorDown.value;
		};

		onMounted(() => {
			const parentEl = parent.getCursorContainer();
			if (!parentEl) return;
			$(parentEl).on('mousemove', handleMouseMove);
			$(parentEl).on('mouseleave', handleLeave);
		});

		onBeforeUnmount(() => {
			const parentEl = parent.getCursorContainer();
			if (!parentEl) return;
			$(document).off('mousemove', handleMouseMoveDocument);
			$(document).off('mouseup', handleMouseUpDocument);
			$(parentEl).off('mousemove', handleMouseMove);
			$(parentEl).off('mouseleave', handleLeave);
		});


		// 用raf优化动画
		watch(
			() => thumbMove.value,
			() => {
				if (!thumb.value) return;
				raf(() => {
					thumb.value.style[TRANSFORM] = `translate${barOptions.value.axis}(${thumbMove.value}px)`;
				});
			},
			{ immediate: true }
		);

		return {
			track,
			thumb,
			thumbSize,
			thumbCalcStyle,

			barOptions,

			isVisible,

			handleClickTrack,
			handleClickThumb
		};
	},
});

</script>


<style lang="scss">
@import '../style/vars.scss';

@include block(vc-scroller-bar) {
	@include element(track) {
		position: absolute;
		z-index: 1;
		border-radius: 4px;
		@include when(vertical) {
			width: 6px;
			top: 0;
			right: 0;
			bottom: 0;

			> div {
				width: 100%;
			}
		}

		@include when(horizontal) {
			height: 6px;
			left: 0;
			right: 0;
			bottom: 0;

			> div {
				height: 100%;
			}
		}
	}

	@include element(thumb) {
		position: relative;
		display: block;
		width: 0;
		height: 0;
		cursor: pointer;
		border-radius: inherit;
		background-color: rgba(37, 36, 36, 0.57);
		transition: .3s background-color;
		will-change: transform, background-color;
		
		&:hover {
			background-color: rgba(37, 36, 36, 0.7);
		}
	}
}
</style>
