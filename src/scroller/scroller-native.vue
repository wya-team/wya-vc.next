<!--
使用原生的滚动（overflow: auto）实现滚动

比scroller-wheel存在两个问题
1. scroll效益比wheel高，导致scroll触发的事件操作scroll*和原生的一定延迟
2. 增加了一层嵌套
-->
<template>
	<div ref="scroller" class="vc-scroller vc-scroller--scroll">
		<div 
			ref="wrapper" 
			:style="[wrapperStyle, wrapperCalcStyle]" 
			:class="[
				wrapperClassName,
				native ? 'is-native' : 'is-hidden',
			]"
			class="vc-scroller__wrapper"
			@scroll="handleScroll"
		>
			<component
				:is="tag"
				ref="content"
				class="vc-scroller__content"
				:style="[contentStyle]"
			>
				<slot />
			</component>
		</div>
		<teleport v-if="!native && (!barDisabled || !barTo)" :to="barTo" :disabled="!barTo">
			<!-- X轴 -->
			<vc-scroller-bar 
				ref="barX"
				v-bind="barBinds"
				:track-offset="[trackOffsetX[3], trackOffsetX[1]]"
				:wrapper-size="wrapperW" 
				:content-size="contentW" 
				:style="{ 
					left: trackOffsetX[3] + 'px',
					bottom: trackOffsetX[2] + 'px'
				}"
				@refresh-scroll="setScrollLeft"
			/>
			<!-- Y轴 -->
			<vc-scroller-bar
				ref="barY"
				v-bind="barBinds"
				:track-offset="[trackOffsetY[0], trackOffsetY[2]]"
				:wrapper-size="wrapperH" 
				:content-size="contentH" 
				:style="{ 
					top: trackOffsetY[0] + 'px', 
					right: trackOffsetY[1] + 'px'
				}"
				vertical
				@refresh-scroll="setScrollTop"
			/>
		</teleport>
		<!-- 通常是用于absolute的元素 TODO: 还需额外定API  -->
		<!-- <slot name="extra" /> -->
	</div>
</template>
<script lang="ts">
import { getCurrentInstance, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { Device } from '@wya/utils';
import { pick } from 'lodash';
import { Resize } from '../utils/resize';
import ScrollerBar from './bar';
import { TRANSFORM } from '../utils';

export default defineComponent({
	name: 'vc-scroller',
	components: {
		'vc-scroller-bar': ScrollerBar
	},
	props: {
		height: {
			type: [String, Number],
			default: '',
		},
		maxHeight: {
			type: [String, Number],
			default: '',
		},
		native: {
			type: Boolean,
			default: false,
		},

		wrapperStyle: {
			type: [String, Array, Object],
			default: '',
		},
		wrapperClassName: {
			type: [String, Array, Object],
			default: '',
		},

		contentStyle: {
			type: [String, Array, Object],
			default: '',
		},
		contentClassName: {
			type: [String, Array, Object],
			default: '',
		},
		autoResize: {
			type: Boolean,
			default: true
		},
		tag: {
			type: String,
			default: 'div',
		},

		// 基于原位置，偏移值（上下左右），top不会作用，left负数代表意味wrapperSize会变长
		trackOffsetX: {
			type: Array,
			default: () => ([0, 0, 0, 0])
		},

		// 基于原位置，偏移值（上下左右），right不会作用，bottom负数代表意味wrapperSize会变长
		trackOffsetY: {
			type: Array,
			default: () => ([0, 0, 0, 0])
		},

		// getCursorContainer: Function,
		barTo: String,
		...pick(ScrollerBar.props, [
			'always',
			'thumbMinSize',
			'thumbStyle',
			'thumbClassName',
			'trackStyle',
			'trackClassName'
		])
	},
	emits: ['scroll'],
	setup(props, { emit }) {
		const instance = getCurrentInstance();
		const barDisabled = ref(true);

		const wrapperW = ref(0);
		const wrapperH = ref(0);

		const contentH = ref(0);
		const contentW = ref(0);

		const wrapper = ref(null);
		const content = ref(null);

		const barX = ref(null);
		const barY = ref(null);

		const wrapperCalcStyle = computed(() => {
			let style = {};
			if (props.height) {
				style.height = typeof props.height !== 'number' ? props.height : `${props.height}px`;
			}
			
			if (props.maxHeight) {
				style.maxHeight = typeof props.maxHeight !== 'number' ? props.maxHeight : `${props.maxHeight}px`;
			}
			return style;
		});

		const barBinds = computed(() => {
			return {
				always: props.always,
				thumbMinSize: props.thumbMinSize,
				thumbStyle: props.thumbStyle,
				trackStyle: props.trackStyle
			};
		});

		// 记录当前容器(wrapper)和内容(content)宽高
		const refreshSize = () => {
			if (!wrapper.value) return;

			wrapperW.value = wrapper.value.clientWidth;
			wrapperH.value = wrapper.value.clientHeight;

			contentH.value = wrapper.value.scrollHeight;
			contentW.value = wrapper.value.scrollWidth;
		};

		const refreshScroll = () => {
			if (!barY.value || !barX.value) return;
			const { scrollTop } = wrapper.value;
			const { scrollLeft } = wrapper.value;

			// 取代当前组件内值变化，避免构建当前组件的虚拟Dom掉帧（解决表格数据多时问题）
			barY.value.scrollTo(scrollTop);
			barX.value.scrollTo(scrollLeft);
		};

		// TODO: 如遇性能问题，增加节流函数
		const refresh = () => {
			refreshSize();
			refreshScroll();
		};

		/**
		 * 用scroll导致bar的抖动，后期可以考虑多嵌套一层
		 */
		const handleScroll = (e) => {
			emit('scroll', e);
			refreshScroll();
		};

		// 这个会主动触发scroll事件
		const setScrollTop = (value: number) => {
			wrapper.value.scrollTop = value;
		};

		// 这个会主动触发scroll事件
		const setScrollLeft = (value: number) => {
			wrapper.value.scrollLeft = value;
		};

		const setBarStatus = () => {
			if (typeof document !== 'undefined' && props.barTo) {
				barDisabled.value = !document.querySelector(props.barTo);
			}
		};

		onMounted(() => {
			if (!props.native) {
				nextTick(refresh);
				nextTick(setBarStatus);
			}
			if (props.autoResize) {
				Resize.on(wrapper.value, refresh);
				Resize.on(content.value, refresh);
			}
		});

		onBeforeUnmount(() => {
			if (props.autoResize) {
				Resize.off(wrapper.value, refresh);
				Resize.off(content.value, refresh);
			}
		});

		provide('scroller', {
			props,
			wrapper,
			content,
			getCursorContainer: () => {
				return (props.barTo && document.querySelector(props.barTo)) || instance?.vnode?.el;
			}
		});

		watch(
			() => props.barTo,
			setBarStatus
		);

		return {
			barDisabled,

			wrapper,
			content,
			barX,
			barY,

			wrapperW,
			wrapperH,

			contentW,
			contentH,

			wrapperCalcStyle,
			barBinds,

			refresh,
			handleScroll,
			setScrollTop,
			setScrollLeft,
		};
	},
});
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-scroller) {
	position: relative;
	@include element(wrapper) {
		overflow: auto;


		@include when(hidden) {
			scrollbar-width: none;
			&::-webkit-scrollbar {
				display: none;
			}
		}
	}
}
</style>
