import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		label: {
			type: String,
			default: ''
		},
		labelWidth: {
			type: Number
		},
		prop: {
			type: String
		},
		required: {
			type: Boolean,
			default: false
		},
		error: {
			type: String
		},
		rules: {
			type: [Array, Object]
		},
		resetByRulesChanged: {
			type: Boolean,
			default: false
		},
		showMessage: {
			type: Boolean,
			default: true
		},
		// validateStatus: {
		// 	type: String
		// },
		labelFor: {
			type: String
		}
	}
});