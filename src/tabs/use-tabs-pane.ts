import { getCurrentInstance, computed, watch, ref, inject, onMounted, onUnmounted, onBeforeUnmount, onBeforeMount } from 'vue'; 
import { IS_SERVER } from '../utils/constant';

export default () => {
	const instance = getCurrentInstance();
	const { props } = instance;

	const currentName = ref(undefined);
	const isLoaded = ref(false);
	const tabs = inject('tabs', {});

	const isActive = computed(() => {
		let state = tabs.currentName.value === (props.name || currentName.value);

		// 副作用
		if (!isLoaded.value && state) {
			isLoaded.value = true; // eslint-disable-line
		}

		return state;
	});

	const isReady = computed(() => {
		return !props.lazy || isLoaded.value || isActive.value;
	});

	const style = computed(() => {
		return isActive.value ? {} : { 
			opacity: 0,
			height: 0, // 避免重用高度
			overflow: 'hidden', // 避免内层的高度影响
		};
	});

	const refresh = () => {
		!instance.isUnmounted && tabs.refresh?.();
	};

	watch(
		() => props.name,
		(v) => {
			currentName.value = v;
			refresh();
		},
		{ immediate: true }
	);

	watch(
		() => props.label,
		refresh
	);

	onMounted(refresh);
	onUnmounted(refresh);

	onBeforeMount(() => {
		tabs.add?.(instance);
	});

	onBeforeUnmount(() => {
		tabs.remove?.(instance);
	});
	
	return {
		currentName,
		isLoaded,
		isActive,
		isReady,
		style
	};
};