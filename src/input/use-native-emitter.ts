export default (input) => {
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