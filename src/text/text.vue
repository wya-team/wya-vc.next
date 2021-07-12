<template>
	<component 
		:is="tag"
		class="vc-text"
		:style="styles"
		@mouseover="handleMouseOver"
		@mouseout="handleMouseOut"
	>
		<vc-customer 
			v-if="isVisible"
			:value="endIndex > 0 ? `${value.slice(0, endIndex)}${suffix}` : value"
			:index="endIndex"
			:render="renderRow"
		/>
	</component>
</template>
<script lang="ts">
import { h, getCurrentInstance, defineComponent, watch, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Resize } from '../utils/resize';
import Customer from '../customer';
import { getFitIndex } from './utils';
import Popover from '../popover/index';

export default {
	name: 'vc-text',
	components: { 
		'vc-customer': Customer
	},
	props: {
		tag: {
			type: String,
			default: 'div'
		},
		value: {
			type: String,
			default: ''
		},
		line: {
			type: Number,
			default: 0
		},
		// TODO: 是否改为tail-indent来表示尾部缩进
		indent: {
			type: Number,
			default: 0
		},
		suffix: {
			type: String,
			default: '...'
		},
		placement: {
			type: String,
			default: 'top'
		},
		portalClassName: [Object, String, Array],
		portalStyle: Object,
		renderRow: {
			type: Function,
			// 函数式可以用于高亮显示
			default: (props, parent) => {
				const { value } = props;
				return h('span', {}, value);
			}
		}
	},
	emits: ['clip'],
	setup(props, context) {
		const instance = getCurrentInstance();
		const { emit } = context;

		const isVisible = ref(false);
		const endIndex = ref(0);

		const styles = computed(() => {
			return { cursor: endIndex.value === 0 ? 'unset' : 'pointer' };
		});

		let timer;
		let popperInstance;
		const calcPosition = () => {
			const { suffix, line, value, indent } = props;
			if (line === 0) {
				endIndex.value = 0;
				isVisible.value = true;
			} else {
				endIndex.value = getFitIndex({
					el: instance.vnode.el,
					line, 
					value, 
					suffix,
					indent
				});
				isVisible.value = true;
			}
			emit('clip', endIndex.value);
		};

		const handleResize = (immediate) => {
			timer && clearTimeout(timer);
			timer = setTimeout(calcPosition, 50);
		};
		
		const handleMouseOver = (e) => {
			if (endIndex.value > 0) {
				popperInstance = null;
				popperInstance = Popover.open({
					el: document.body,
					cName: 'vc-text-popover', // 确保不重复创建
					triggerEl: e.target,
					hover: true,
					theme: 'dark',
					placement: props.placement,
					portalClassName: props.portalClassName,
					portalStyle: props.portalStyle,
					content: props.value,
					alone: true
				});
			}
		};

		const handleMouseOut = () => {
			popperInstance = null;
		};

		['value', 'indent', 'line'].forEach((key) => {
			watch(
				() => props[key],
				calcPosition
			);
		});

		onMounted(() => {
			setTimeout(calcPosition, 0);

			Resize.on(instance.vnode.el, handleResize);
		});

		onBeforeUnmount(() => {
			Resize.off(instance.vnode.el, handleResize);
			timer && clearTimeout(timer);
		});

		return {
			isVisible,
			styles,
			endIndex,
			handleMouseOver,
			handleMouseOut
		};
	}
};
</script>
<style lang="scss">
.vc-text {
	position: relative;
	display: inline-block;
	word-break: break-all;
	width: 100%;
	span {
		word-break: break-all;
		display: block;
	}
}
</style>
