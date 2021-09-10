import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		enterText: {
			type: [Boolean, String],
			default: true
		}
	}
});
