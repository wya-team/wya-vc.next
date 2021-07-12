import { computed, getCurrentInstance, reactive } from 'vue';

export default (mapper, $store) => {
	const instance = getCurrentInstance();
	const store = $store || instance.proxy.store; 

	// computedRef自动解包
	const states = reactive({});
	Object.keys(mapper).forEach((key) => {
		const value = mapper[key];
		if (typeof value === 'string') {
			states[key] = computed(() => {
				return store.states[value];
			});
		} else if (typeof value === 'function') {
			states[key] = computed(() => {
				return value(store.states);
			});
		} else {
			console.error('invalid value type');
		}
	});

	return states;
};
