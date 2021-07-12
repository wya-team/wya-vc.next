export default {
	props: {
		type: {
			type: String,
			validator: v => /(text|password|tel|search|date|number|email|url)/.test(v),
			default: 'text'
		},
		modelValue: {
			type: [String, Number, Array], // Array, 作为select等数组存放临时值
			default: ''
		},
		placeholder: {
			type: String,
			default: ''
		},
		maxlength: Number,
		disabled: {
			type: Boolean,
			default: false
		},
		readonly: {
			type: Boolean,
			default: false
		},
		name: {
			type: String
		},
		autofocus: {
			type: Boolean,
			default: false
		},
		spellcheck: {
			type: Boolean,
			default: false
		},
		autocomplete: {
			validator: v => /^(on|off|new-password)$/.test(v),
			default: 'off'
		},
		clearable: {
			type: Boolean,
			default: false
		},
		elementId: {
			type: String
		},
		prepend: {
			type: String
		},
		append: {
			type: String
		},
		afloat: {
			type: Boolean,
			default: false
		},	
		inputStyle: {
			type: [Object, Array]
		},
		allowDispatch: {
			type: Boolean,
			default: true
		},
		// 聚焦时光标是否在文字最后面
		focusEnd: {
			type: Boolean,
			default: false
		},
		// 是否按字节数计算长度，1个长度 = 2个字节，影响maxlength
		bytes: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		'update:modelValue',
		'input',
		'change',
		'focus',
		'blur',
		'clear',
		'paste',
		'keydown',
		'keypress',
		'keyup',
		'enter',
		'tip',
		'cancel'
	],
};
