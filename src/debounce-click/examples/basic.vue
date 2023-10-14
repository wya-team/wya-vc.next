<template>
	<vc-debounce-click 
		tag="div" 
		type="primary"
		class="v-debounce-click"
		@click="handleClick"
	>
		点击 {{ count }}
	</vc-debounce-click>
</template>
<script>
import { defineComponent, ref } from 'vue';
import DebounceClick from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-debounce-click': DebounceClick,
	},
	setup() {
		const count = ref(0);
		return {
			count,
			handleClick(e) {
				count.value++;
				console.log(e, new Date());
			}
		};
	}
});
</script>
