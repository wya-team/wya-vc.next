<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<vc-rate
			v-model="value"
			half
			clearable
			color="#ff0000"
			:tooltips="tooltips"
		/>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Rate from '..';

export default defineComponent({
	name: "vc-rate-basic",
	components: {
		'vc-rate': Rate,
	},
	setup() {
		const value = ref(3.5);
		const tooltips = ref(['极差', '差', '一般', '好', '极好']);
		return {
			value,
			tooltips
		};
	}
});
</script>
