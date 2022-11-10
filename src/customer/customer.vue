<template>
	<component 
		:is="Customer" 
		v-bind="attrs" 
	/>
</template>

<script lang="tsx">
import { defineComponent, resolveDynamicComponent } from 'vue';
import { useAttrs } from '../hooks';

/**
 * 原生支持render, 这里仅作为语义化 
 * 写法不同，但与vue@2.x 保持一致
 */
export default defineComponent({
	name: 'vc-customer',
	inheritAttrs: false,
	props: {
		render: {
			type: Function,
			default: () => ((props, context) => null)
		}
	},
	setup(props, context) {
		// attrs能响应变化
		const attrs = useAttrs();
		// 主要目的是让插槽生效
		const Customer = resolveDynamicComponent(() => {
			return props.render(attrs.value, context);
		});

		return {
			attrs,
			Customer
		};
	}
});

</script>
