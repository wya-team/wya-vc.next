<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<h1>Basic</h1>353
		<vc-rate />
	</div>
</template>
<script>
import { defineComponent } from 'vue';
import Rate from '..';

export default defineComponent({
	name: "vc-rate-basic",
	components: {
		'vc-rate': Rate,
	}
});
</script>
