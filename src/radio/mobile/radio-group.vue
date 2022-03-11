<template>
	<div 
		v-if="!fragment"
		:name="name" 
		:class="classes" 
		class="vcm-radio-group"
	>
		<slot />
	</div>
	<slot v-else />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import RadioGroupMixin from '../radio-group-mixin';
import useRadioGroup from '../use-radio-group';

export default defineComponent({
	name: 'vcm-radio-group',
	mixins: [RadioGroupMixin],
	setup(props, context) {
		return useRadioGroup();
	}
});
</script>
<style lang="scss">
@import '../../style/vars.scss';

$size: 28px;

@include block(vcm-radio-group) {
	display: inline-block;
	font-size: 16px;
	line-height: unset;
	@include when(vertical) {
		.vcm-radio {
			display: block;
			height: 24px;
			line-height: 24px;
		}
	}
}
</style>