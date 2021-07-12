export default {
	props: {
		modelValue: {
			type: [String, Number]
		},
		animated: {
			type: Boolean,
			default: false
		},
		showAfloat: {
			type: Boolean,
			default: true
		},
	},
	emits: ['update:modelValue', 'change', 'click']
};

