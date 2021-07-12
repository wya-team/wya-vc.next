import Extends from '../extends';

export default {
	name: 'vc-switch',
	props: {
		modelValue: {
			type: [String, Number, Boolean],
			default: false
		},
		trueValue: {
			type: [String, Number, Boolean],
			default: true
		},
		falseValue: {
			type: [String, Number, Boolean],
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		name: {
			type: String
		},
		openText: {
			type: String,
			default: ''
		},
		closeText: {
			type: String,
			default: ''
		}
	},
	// click -> onClick要被拦截，此处不能放置
	emits: ['update:modelValue', 'change', 'click']
};