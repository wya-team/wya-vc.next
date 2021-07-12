<template>
	<vc-page
		v-model:current="current"
		:count="100" 
		:total="100" 
		show-count 
		show-elevator 
		show-sizer 
	/>
</template>
<script>
import { defineComponent, ref, onUpdated } from 'vue';
import Page from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-page': Page
	},
	setup(props, context) {
		const current = ref(3);

		onUpdated(() => {
			console.log(current.value);
		});

		return {
			current
		};
	}
});
</script>
