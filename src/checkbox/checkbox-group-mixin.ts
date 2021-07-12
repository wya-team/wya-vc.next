export default {
	props: {
		modelValue: {
			type: Array,
			default: () => ([])
		}
	},
	emits: ['update:modelValue', 'change']
};