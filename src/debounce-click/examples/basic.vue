<template>
	<vc-debounce-click 
		tag="div" 
		type="primary"
		class="v-debounce-click"
		@click="handleClick"
	>
		点击
	</vc-debounce-click>
</template>
<script>
import { defineComponent } from 'vue';
import DebounceClick from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-debounce-click': DebounceClick,
	},
	setup() {
		return {
			handleClick(e) {
				console.log(e, new Date());
			}
		};
	}
});
</script>
