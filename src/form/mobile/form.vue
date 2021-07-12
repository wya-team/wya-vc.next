<template>
	<form :autocomplete="autocomplete" :class="{ 'is-border': border }" class="vcm-form">
		<slot />
	</form>
</template>

<script>
import basicFormMixin from '../form-mixin';
import MToast from '../../toast/index.m';
import useForm from '../use-form';

export default {
	name: 'vcm-form',
	mixins: [basicFormMixin],
	props: {
		showMessage: {
			type: Boolean,
			default: true
		},
		border: {
			type: Boolean,
			default: false
		}
	},
	setup() {
		return useForm(
			{
				throwToast(msg) {
					MToast.info(msg);
				}
			}
		);
	}
};
</script>
<style lang="scss">
@import '../../style/vars.scss';
$block: vcm-form;

@include block($block) {
	@include when(border) {
		@include commonBorder1PX(top);
		@include commonBorder1PX(bottom);
	}
}

</style>