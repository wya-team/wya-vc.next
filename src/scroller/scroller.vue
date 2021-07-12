<template>
	<div class="vc-scroller">
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
		<template v-if="!native">
			<vc-scroller-bar 
				v-bind="barBinds"
				:scroll-offset="scrollX" 
				:wrapper-size="wrapperW" 
				:content-size="contentW" 
			/>
			<vc-scroller-bar
				v-bind="barBinds"
				:scroll-offset="scrollY"
				:wrapper-size="wrapperH" 
				:content-size="contentH" 
				vertical
			/>
		</template>
		<!-- 通常是用于absolute的元素 TODO: 还需额外定API  -->
		<!-- <slot name="extra" /> -->
	</div>
</template>
<script lang="ts">
import { getCurrentInstance, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { Device } from '@wya/utils';
import { pick } from 'lodash';
import { Resize } from '../utils/resize';
import ScrollerBar from './bar.vue';
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
		const wrapperW = ref(0);
		const wrapperH = ref(0);

		const contentH = ref(0);
		const contentW = ref(0);

		const scrollX = ref(0);
		const scrollY = ref(0);

		const wrapper = ref(null);
		const content = ref(null);

		const wrapperCalcStyle = computed(() => {
			let style = {};

			style.height = typeof props.height !== 'number' ? props.height : `${props.height}px`;
			style.maxHeight = typeof props.maxHeight !== 'number' ? props.maxHeight : `${props.maxHeight}px`;
			
			return style;
		});

		const barBinds = computed(() => {
			return {
				always: props.always,
				thumbMinSize: props.thumbMinSize,
				thumbStyle: props.thumbStyle,
				trackStyle: props.trackStyle,
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

		// 记录当前容器(wrapper)滚动的位移
		const refreshScroll = () => {
			if (!wrapper.value) return;

			scrollY.value = wrapper.value.scrollTop;
			scrollX.value = wrapper.value.scrollLeft;
		};

		const refresh = () => {
			refreshSize();
			refreshScroll();
		};

		/**
		 * 用scroll导致bar的抖动，后期可以考虑多嵌套一层
		 */
		const handleScroll = (e, data) => {
			refreshScroll();
			emit('scroll', e, data);
		};

		const setScrollTop = (value: number) => {
			wrapper.value.scrollTop = value;
			scrollY.value = value;
		};

		const setScrollLeft = (value: number) => {
			wrapper.value.scrollLeft = value;
			scrollY.value = value;

		};

		onMounted(() => {
			if (!props.native) {
				nextTick(refresh);
			}
			if (props.autoResize) {
				Resize.on(wrapper.value, refresh);
			}
		});

		onBeforeUnmount(() => {
			if (props.autoResize) {
				Resize.off(wrapper.value, refresh);
			}
		});

		provide('scroller', {
			props,
			wrapper,
			content,
			refreshScroll
		});

		return {
			wrapper,
			content,

			scrollX,
			scrollY,

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
