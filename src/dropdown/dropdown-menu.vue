<template>
	<ul class="vc-dropdown-menu">
		<slot />
	</ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'vc-dropdown-menu',
});
</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-dropdown-menu;

@include block($block) {
	min-width: 100px;
}
</style>
