<template>
	<div class="vc-timeline">
		<slot />
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'vc-timeline'
});
</script>
