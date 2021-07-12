import { ref, onMounted, nextTick } from 'vue';

export default () => {
	const isReady = ref(false);

	onMounted(() => {
		nextTick(() => {
			isReady.value = true;
		});
	});

	return isReady;
};