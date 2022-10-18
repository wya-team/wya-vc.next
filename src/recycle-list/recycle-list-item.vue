<template>
	<div 
		ref="current"
		class="vc-recycle-list-item" 
	>
		<slot />
	</div>
</template>

<script lang="ts">
import { 
	defineComponent,
	ref,
	computed,
	getCurrentInstance,
	onMounted,
	onBeforeUnmount,
	nextTick 
} from 'vue';
import { Resize } from '../utils/resize';

export default defineComponent({
	name: 'vc-recycle-list-item',
	emits: ['resize'],
	setup(props, { emit, slots }) {
		const current = ref();
		const offsetHeight = ref(0); 
		const handleResize = () => {
			const v = current.value.offsetHeight;
			const changed = offsetHeight.value != v;
			if (changed) {
				offsetHeight.value = v;
				emit('resize');
			}
		};

		onMounted(() => {
			offsetHeight.value = current.value.offsetHeight;
			Resize.on(current.value, handleResize);
		});

		onBeforeUnmount(() => {
			Resize.off(current.value, handleResize);
		});

		return {
			current,
			offsetHeight
		};
	}
});

</script>

<style lang="scss">

</style>
