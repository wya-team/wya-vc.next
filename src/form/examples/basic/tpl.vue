<template>
	<div>
		<input :type="type" :value="modelValue" @input="handleInput">
		<slot />
	</div>
</template>

<script>
import { inject, ref } from 'vue';

export default {
	name: 'vc-form-tpl',
	props: {
		type: String,
		modelValue: [String, Number],
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const formItem = inject('form-item');
		return {
			handleInput(e) {
				emit('update:modelValue', e.target.value);

				// form表单
				formItem.change?.();
			}
		};
	}
};
</script>

<style lang="scss">
</style>
