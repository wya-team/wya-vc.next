<template>
	<div class="vcm-checkbox-group">
		<slot />
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import CheckboxGroupMixin from '../checkbox-group-mixin';
import useCheckboxGroup from '../use-checkbox-group';

export default defineComponent({
	name: 'vcm-checkbox-group',
	mixins: [CheckboxGroupMixin],
	setup() {
		return useCheckboxGroup();
	}
});
</script>
<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-checkbox-group) {
	font-size: 16px;
}
</style>