import { getUid } from '../utils/index';

export default {
	props: {
		modelValue: {
			type: [String, Number],
			default: ''
		},
		type: {
			type: String,
			default: '', // 'button'
		},
		vertical: {
			type: Boolean,
			default: false
		},
		name: {
			type: String,
			default: () => getUid('radio')
		},
		disabled: {
			type: Boolean,
			default: false
		},
		fragment: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'change']
};