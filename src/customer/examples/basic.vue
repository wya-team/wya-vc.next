<template>
	<h2>v3新增默认语法：可不使用组件</h2>
	<component 
		:is="renderHeader" 
		:value="value"
		class="vc-customer-basic"
		@click="handleClick"
		@customer-click="hadnleCustomerClick"
	>
		<template #default>
			default: v3
		</template>
		<template #content="{ info }">
			content: {{ info }}
		</template>
	</component>
	<h2>仅语义化: vc-customer </h2>
	<vc-customer 
		:render="renderHeader" 
		:value="value"
		class="vc-customer-basic"
		@click="handleClick"
		@customer-click="hadnleCustomerClick"
	>
		<template #default>
			default: <span>vc-customer</span>
		</template>
		<template #content="{ info }">
			{{ info }}: vc-customer 
		</template>
	</vc-customer>
</template>

<script lang="jsx">
import { ref, defineComponent } from 'vue';
import Customer from '..';

export default defineComponent({
	name: "vc-customer-basic",
	components: {
		'vc-customer': Customer
	},
	setup() {
		const value = ref('Hello World!');
		const renderHeader = ($props, { attrs, slots, emit }) => {
			return (
				<ul class="g-flex-cc" onClick={(e) => emit('customer-click', e)}>
					<li>实时响应：{ attrs.value }</li> 
					<li>实时响应：{ $props?.value }</li> 
					<li>实时响应{ value.value }</li> 
					<li>插槽default { slots.default() }</li> 
					<li>插槽content { slots.content({ info: "content" }) }</li> 
				</ul>
			);
		};
		return {
			value,
			renderHeader,
			handleClick(e) {
				value.value += '!';
			},
			hadnleCustomerClick(e) {
				console.log(e);
			}
		};
	}
});
</script>
<style>
.vc-customer-basic span {
	color: red;
}
</style>
