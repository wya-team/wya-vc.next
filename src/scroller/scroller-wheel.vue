<!--
scroller-wheel
为减少一层嵌套，为去除滚动bar的抖动，使用wheel模拟

基于Chrome 91.0.4472.114版本测试：
原生scroll事件：不会触发重排和重绘
原生wheel事件设置scrollTop：不会触发重排和重绘
transform在测试过程中会出现重绘，不会重排
【以上为测试结果，和之前的Chrome可能会不一致，如以往transfrom不会触发重绘，scroll会触发重排】

做抖动优化：
使用scroll原生时，bar(可以没有),thumb都会出现抖动，这里选择用wheel代替解决该问题;
测试时设置scrollTop没有重排重绘，暂不考虑改用transfrom来改变content
-->
<!-- 这里wrapper为了保持和嵌套的scroller-native一致 -->
<template>
	<div 
		ref="wrapper" 
		v-event:wheel="wheel"
		:style="[wrapperStyle, calcWrapperStyle]" 
		:class="[wrapperClassName, native ? 'is-native' : 'is-hidden']"
		class="vc-scroller vc-scroller--wheel"
		@scroll="handleNativeScroll"
	>
		<component
			:is="tag"
			ref="content"
			class="vc-scroller__content"
			:style="[contentStyle]"
		>
			<slot />
		</component>
		<teleport v-if="!native && (!barDisabled || !barTo)" :to="barTo" :disabled="!barTo">
			<!-- X轴 -->
			<vc-scroller-bar 
				ref="barX"
				v-bind="barBinds"
				:track-offset="[trackOffsetX[3], trackOffsetX[1]]"
				:wrapper-size="wrapperW" 
				:content-size="contentW" 
				:style="[
					{
						left: trackOffsetX[3] + 'px',
						bottom: trackOffsetX[2] + 'px'
					}
				]"
				@refresh-scroll="setScrollLeft"
			/>
			<!-- Y轴 -->
			<vc-scroller-bar
				ref="barY"
				v-bind="barBinds"
				:track-offset="[trackOffsetY[0], trackOffsetY[2]]"
				:wrapper-size="wrapperH" 
				:content-size="contentH" 
				:style="[
					{
						top: trackOffsetY[0] + 'px', 
						right: trackOffsetY[1] + 'px'
					}
				]"
				vertical
				@refresh-scroll="setScrollTop"
			/>
		</teleport>
	</div>
</template>
<script lang="ts">
import { getCurrentInstance, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { Device } from '@wya/utils';
import { pick } from 'lodash';
import { Resize } from '../utils/resize';
import ScrollerBar from './bar';
import Extends from '../extends';
import { TRANSFORM } from '../utils';
import Wheel from '../utils/wheel';

export default defineComponent({
	name: 'vc-scroller',
	directives: {
		...Extends.directives('event')
	},
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
	emits: ['wheel', 'mousewheel', 'scroll'],
	setup(props, { emit }) {
		const instance = getCurrentInstance();
		const barDisabled = ref(true);
		const wrapperW = ref(0);
		const wrapperH = ref(0);

		const contentH = ref(0);
		const contentW = ref(0);

		const scrollX = ref(0);
		const scrollY = ref(0);

		const wrapper = ref(null);
		const content = ref(null);

		const barX = ref(null);
		const barY = ref(null);

		const barBinds = computed(() => {
			return {
				always: props.always,
				thumbMinSize: props.thumbMinSize,
				thumbStyle: props.thumbStyle,
				trackStyle: props.trackStyle,
				trackOffset: props.trackOffset
			};
		});

		const barPos = computed(() => {
			const maxMoveX = contentW.value - wrapperW.value;
			const maxMoveY = contentH.value - wrapperH.value;

			const fitMoveX = scrollX.value >= maxMoveX ? maxMoveX : scrollX.value;
			const fitMoveY = scrollY.value >= maxMoveY ? maxMoveY : scrollY.value;

			return `translate(${fitMoveX}px, ${fitMoveY}px)`;
		});

		const calcWrapperStyle = computed(() => {
			let style = {};

			if (props.height) {
				style.height = typeof props.height !== 'number' ? props.height : `${props.height}px`;
			}
			if (props.maxHeight) { 
				style.maxHeight = typeof props.maxHeight !== 'number' ? props.maxHeight : `${props.maxHeight}px`;

			}
			return style;
		});

		// 记录当前容器(wrapper)和内容(content)宽高
		const refreshSize = () => {
			if (!wrapper.value) return;

			wrapperW.value = wrapper.value.clientWidth;
			wrapperH.value = wrapper.value.clientHeight;

			contentH.value = wrapper.value.scrollHeight;
			contentW.value = wrapper.value.scrollWidth;
		};

		// 记录当前容器(wrapper)滚动的位移
		const refreshScroll = () => {
			if (!barY.value || !barX.value) return;

			scrollY.value = wrapper.value.scrollTop;
			scrollX.value = wrapper.value.scrollLeft;

			let barParentEl = document.querySelector(props.barTo);
			if (!barParentEl || barParentEl === instance.vnode.el) {
				barY.value.$el.style[TRANSFORM] = barPos.value;
				barX.value.$el.style[TRANSFORM] = barPos.value;
			}
			// 取代当前组件内值变化，避免构建当前组件的虚拟Dom掉帧（解决表格数据多时问题）
			barY.value.scrollTo(scrollY.value);
			barX.value.scrollTo(scrollX.value);

			emit('scroll', { target: wrapper.value });
		};

		// TODO: 如遇性能问题，增加节流函数
		const refresh = () => {
			refreshSize();
			refreshScroll();
		};
		const handleWheel = (deltaX, deltaY) => {
			const el = wrapper.value; // wrapper
			if (
				Math.abs(deltaY) > Math.abs(deltaX) 
				&& contentH.value > wrapperH.value
			) {
				el.scrollTop = Math.min(
					Math.max(0, scrollY.value + deltaY),
					contentH.value - wrapperH.value
				);
				
			} else if (deltaX && contentW.value > wrapperW.value) {
				el.scrollLeft = Math.min(
					Math.max(0, scrollX.value + deltaX),
					contentW.value - wrapperW.value
				);
			}

			refreshScroll();
		};

		// X轴是否允许滚动
		const shouldWheelX = (delta) => {
			if (props.native || wrapperW.value === contentW.value) {
				return false;
			}

			delta = Math.round(delta);
			if (delta === 0) {
				return false;
			}

			return (
				(delta < 0 && scrollX.value > 0) 
				|| (delta >= 0 && scrollX.value < contentW.value - wrapperW.value)
			);
		};

		// Y轴是否允许滚动
		const shouldWheelY = (delta) => {
			if (props.native || wrapperH.value === contentH.value) {
				return false;
			}

			delta = Math.round(delta);
			if (delta === 0) {
				return false;
			}

			return (
				(delta < 0 && scrollY.value > 0) 
				|| (delta >= 0 && scrollY.value < contentH.value - wrapperH.value)
			);
		};
		let wheel = new Wheel(
			{
				behavior: 'scroll',
				onWheel: handleWheel,
				shouldWheelX,
				shouldWheelY
			}
		);
		const setScrollTop = (value: number) => {
			wrapper.value.scrollTop = value;
			refreshScroll();
		};

		const setScrollLeft = (value: number) => {
			wrapper.value.scrollLeft = value;
			refreshScroll();
		};

		const setBarStatus = () => {
			if (typeof document !== 'undefined' && props.barTo) {
				barDisabled.value = !document.querySelector(props.barTo);
			}
		};

		const handleNativeScroll = (e) => {
			if (props.native) {
				emit('scroll', e);
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

		return {
			barDisabled,

			wrapper,
			content,
			wheel,
			
			barBinds,
			barX,
			barY,

			scrollX,
			scrollY,

			wrapperW,
			wrapperH,

			contentW,
			contentH,

			calcWrapperStyle,
			refresh,
			setScrollTop,
			setScrollLeft,

			handleNativeScroll
		};
	},
});
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-scroller) {
	overflow: hidden;
	position: relative;

	@include when(hidden) {
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}

	@include when(native) {
		overflow: auto;
	}
}
</style>
