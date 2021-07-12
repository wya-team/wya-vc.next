<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<h1>Basic</h1>353
		<vc-action-sheet />
	</div>
</template>
<script>
import { defineComponent } from 'vue';
import ActionSheet from '..';

export default defineComponent({
	name: "vc-action-sheet-basic",
	components: {
		'vc-action-sheet': ActionSheet,
	}
});
</script>
