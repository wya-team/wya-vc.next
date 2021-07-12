export default {
	props: {
		model: {
			type: Object
		},
		rules: {
			type: Object
		},
		labelWidth: {
			type: Number,
		},
		showMessage: {
			type: Boolean,
			default: true
		},
		inline: {
			type: Boolean,
			default: false
		},
		labelPosition: {
			validator: v => /^(left|right|top)$/.test(v),
			default: 'right'
		},
		autocomplete: {
			validator: v => /^(on|off)$/.test(v),
			default: 'off'
		},
	}
};