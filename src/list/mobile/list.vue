<template>
	<div :class="{ 'is-border': border }" class="vcm-list">
		<slot />
	</div>
</template>
<script>
import { defineComponent, provide } from 'vue';

export default defineComponent({
	name: "vc-list",
	props: {
		labelWidth: {
			type: [String, Number],
			default: ''
		},
		border: {
			type: Boolean,
			default: true
		}
	},
	setup(props) {
		provide('list', { props });
	}
});
</script>
<style lang="scss">
@import '../../style/vars.scss';
@include block(vcm-list) {
	@include when(border) {
		@include commonBorder1PX(top);
		@include commonBorder1PX(bottom);
	}
}
</style>
