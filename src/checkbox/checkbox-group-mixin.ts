export default {
	props: {
		modelValue: {
			type: Array,
			default: () => ([])
		},
		fragment: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'change']
};