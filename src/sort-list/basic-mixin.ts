export default {
	props: {
		tag: {
			type: String,
			default: 'div'
		},
		modelValue: {
			type: Array,
			default() {
				return [];
			},
		},
		valueKey: {
			type: [String, Number],
			default: 'id'
		},
		// 是否可拖拽 如 [ { id: 1， draggable: false } ]
		draggableKey: String,
		mask: {
			type: Boolean,
			default: true
		},
		draggable: {
			type: Boolean,
			default: true
		}
	},
	emits: ['update:modelValue', 'change']
};