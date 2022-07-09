import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export default defineComponent({
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
			type: String as PropType<'left' | 'right' | 'top'>,
			default: 'right'
		},
		autocomplete: {
			type: String as PropType<'on' | 'off'>,
			default: 'off'
		},
		styleless: {
			type: Boolean,
			default: false
		}
	}
});