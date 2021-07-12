<template>
	<section>
		<div 
			v-for="(item, index) in items"
			:key="item"
			:class="{ 'red': modelValue.includes(item) }"
			@click="handleClick($event, item, index)"
		>
			{{ item }}
		</div>
	</section>
</template>

<script>
import { inject, ref, reactive, toRaw } from 'vue';

export default {
	name: 'vc-form-array',
	props: {
		type: String,
		modelValue: {
			type: Array,
			default: () => []
		},
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const items = ref([1, 2, 3, 4]);
		const formItem = inject('form-item', {});
		return {
			items,
			handleClick(e, item, index) {
				/**
				 * 注意：引用对象发生变化UI才会触发更新，值变化，引用不变无法更新，除非由v3内部的钩子（如push才行）
				 * 不用toRaw可以使用push, 内部有钩子
				 * 用toRaw不可以使用push, 同一引用且无钩子
				 */
				let v = toRaw(props.modelValue) || [];
				if (!v.includes(item)) {
					v = v.concat([item]);
				} else {
					v = v.filter((it) => it !== item);
				}
				// console.log(toRaw(props.modelValue) === v);
				emit('update:modelValue', v);
				formItem.change?.(v);
			}
		};
	}
};
</script>

<style lang="scss">
section {
	display: flex;
	> div {
		border: 1px solid #c9c9c9;
		padding: 40px 20px
	}
	.red {
		color: red;
		border: 1px solid red;
	}
}
</style>
