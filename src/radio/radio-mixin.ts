export default {
	props: {
		disabled: {
			type: Boolean,
			default: false
		},
		modelValue: {
			type: [String, Number, Boolean],
			default: false
		},
		label: {
			type: [String, Number, Boolean]
		},
		name: {
			type: String
		},
		/**
		 * group模式下无效
		 */
		trueValue: {
			type: [String, Number, Boolean],
			default: true
		},
		falseValue: {
			type: [String, Number, Boolean],
			default: false
		},
	},
	emits: ['update:modelValue', 'change']
};