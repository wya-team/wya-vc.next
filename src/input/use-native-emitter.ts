import type { Ref } from 'vue'; 


export default (input: Ref<Nullable<HTMLElement>>) => {
	return {
		focus() {
			input.value?.focus?.();
		},
		blur() {
			input.value?.blur?.();
		},
		click() {
			input.value?.click?.();
			this.focus();
		}
	};
};