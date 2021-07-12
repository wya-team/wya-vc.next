import { pick } from 'lodash';
import InputMixin from '../input/input-mixin';

export default {
	props: {
		...pick(InputMixin.props, [
			'elementId',  
			'autocomplete', 
			'placeholder', 
			'disabled', 
			'maxlength', 
			'readonly', 
			'name',
			'autofocus',
			'allowDispatch',
			'modelValue',
			'bytes'
		]),
		wrap: {
			type: String,
			validator: v => /(soft|hard)/.test(v),
			default: 'soft',

		},
		rows: {
			type: Number,
			default: 2
		},
		autosize: {
			type: [Boolean, Object],
			default: false
		},
		textareaStyle: {
			type: [Object, Array]
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
		'cancel',
		'resize'
	],
};