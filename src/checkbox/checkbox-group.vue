<template>
	<div class="vc-checkbox-group">
		<slot />
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import CheckboxGroupMixin from './checkbox-group-mixin';
import useCheckboxGroup from './use-checkbox-group';

export default defineComponent({
	name: 'vc-checkbox-group',
	mixins: [CheckboxGroupMixin],
	setup() {
		return useCheckboxGroup();
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-checkbox-group) {
	font-size: 14px;
}
</style>