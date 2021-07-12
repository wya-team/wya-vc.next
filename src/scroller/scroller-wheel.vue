<!--
为减少一层嵌套，为去除滚动bar的抖动，使用wheel模拟
	
基于Chrome 91.0.4472.114版本测试：
原生scroll事件：不会触发重排和重绘
原生wheel事件设置scrollTop：不会触发重排和重绘
transform在测试过程中会出现重绘，不会重排
【以上为测试结果，和之前的Chrome可能会不一致，如以往transfrom不会触发重绘，scroll会触发重排】

做抖动优化：
使用scroll原生时，bar(可以没有),thumb都会出现抖动，这里选择用wheel代替解决该问题;
测试时设置scrollTop没有重排重绘，暂不考虑改用transfrom来改变content

目前存在的问题
  1. 在嵌套上，会不协调；【要额外再控制】
  2. 临界值直接触发父层（也有滚动的话，window滚动套vc-scroller滚动）继续滚动 【要额外处理】
  3. Windows在X轴wheel过快与Mac不一致 【要额外处理】
 -->
<template>
	<div 
		ref="wrapper" 
		v-event:wheel="handleWheel"
		:style="calcStyleStyle" 
		:class="native ? 'is-native' : 'is-hidden'"
		class="vc-scroller"
	>
		<component
			:is="tag"
			ref="content"
			class="vc-scroller__content"
			:style="[contentStyle]"
		>
			<slot />
		</component>
		<template v-if="!native">
			<vc-scroller-bar 
				:scroll-offset="scrollX" 
				:wrapper-size="wrapperW" 
				:content-size="contentW" 
				:always="always"
				:style="barStyle"
			/>
			<vc-scroller-bar
				:scroll-offset="scrollY"
				:wrapper-size="wrapperH" 
				:content-size="contentH" 
				:always="always"
				:style="barStyle"
				vertical
			/>
		</template>
	</div>
</template>
<script lang="ts">
import { getCurrentInstance, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { Device } from '@wya/utils';
import { Resize } from '../utils/resize';
import ScrollerBar from './bar.vue';
import Extends from '../extends';
import { TRANSFORM } from '../utils';

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
		always: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['wheel', 'mousewheel'],
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

		const barStyle = computed(() => {
			const maxMoveX = contentW.value - wrapperW.value;
			const maxMoveY = contentH.value - wrapperH.value;

			const fitMoveX = scrollX.value >= maxMoveX ? maxMoveX : scrollX.value;
			const fitMoveY = scrollY.value >= maxMoveY ? maxMoveY : scrollY.value;

			return {
				[TRANSFORM]: `translate(${fitMoveX}px, ${fitMoveY}px)`
			};
		});

		const calcStyleStyle = computed(() => {
			let style = {};

			style.height = typeof props.height !== 'number' ? props.height : `${props.height}px`;
			style.maxHeight = typeof props.maxHeight !== 'number' ? props.maxHeight : `${props.maxHeight}px`;
			
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
			if (!wrapper.value) return;

			scrollY.value = wrapper.value.scrollTop;
			scrollX.value = wrapper.value.scrollLeft;
		};

		const refresh = () => {
			refreshSize();
			refreshScroll();
		};

		/**
		 * t
		 */
		const handleWheel = (e, data) => {
			if (props.native) return emit('wheel', e, data);

			const el = wrapper.value || e.currentTarget; // wrapper;
			const { scrollLeft, scrollWidth, clientWidth, scrollTop, scrollHeight, clientHeight } = el;

			// 阻止X，Y轴上的滚动时，父层滚动（mac下的父层滚动越界会带有回弹）
			if (data.pixelY < 0 && scrollTop !== 0) {
				e.preventDefault();
			} else if (data.pixelY > 0 && scrollHeight - clientHeight > scrollTop) {
				e.preventDefault();
			} else if (data.pixelX < 0 && scrollLeft !== 0) {
				e.preventDefault();
			} else if (data.pixelX > 0 && scrollWidth - clientWidth > scrollLeft) {
				e.preventDefault();
			}

			if (Math.abs(data.spinY) > 0) {
				el.scrollTop += Math.ceil(data.pixelY);
			} else if (Math.abs(data.spinX) > 0) {
				el.scrollLeft += Math.ceil(data.pixelX);
			}

			refreshScroll();
			emit('wheel', e, data);
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

			barStyle,

			scrollX,
			scrollY,

			wrapperW,
			wrapperH,

			contentW,
			contentH,

			calcStyleStyle,
			refresh,
			handleWheel,
			setScrollTop,
			setScrollLeft,
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
