<template>
	<!-- tabindex="0" -->
	<span
		:class="[classes]"
		class="vc-switch"
		@click="handleToggle"
		@keydown.space="handleToggle"
	>
		<input :name="name" :value="currentValue" type="hidden">
		<span class="vc-switch__content">
			<slot v-if="currentValue === trueValue" name="open">
				{{ openText }}
			</slot>
			<slot v-if="currentValue === falseValue" name="close">
				{{ closeText }}
			</slot>	
		</span>
		<span class="vc-switch__inner" />
		<vc-spin 
			v-if="isLoading" 
			:size="14"
			foreground="#fff"
			class="vc-switch__loading"
		/>
	</span>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Spin from '../spin';
import BasicMixin from './basic-mixin';
import useSwicth from './use-switch';

export default defineComponent({
	name: 'vc-switch',
	components: {
		'vc-spin': Spin
	},
	mixins: [BasicMixin],
	setup() {
		return useSwicth();
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-switch) {
	display: inline-block;
	width: 44px;
	height: 22px;
	line-height: 20px;
	border-radius: 22px;
	vertical-align: middle;
	border: 1px solid #d9d9d9;
	background-color: #d9d9d9;
	position: relative;
	cursor: pointer;
	user-select: none;
	transition: all .2s ease-in-out;
	@include element(content) {
		color: #fff;
		font-size: 12px;
		position: absolute;
		left: 23px;
	}
	@include element(inner) {
		content: '';
		width: 18px;
		height: 18px;
		border-radius: 18px;
		background-color: #fff;
		position: absolute;
		left: 1px;
		top: 1px;
		cursor: pointer;
		transition: left .2s ease-in-out,width .2s ease-in-out;
	}
	@include element(loading) {
		width: 14px;
		height: 14px;
		position: absolute;
		left: 3px;
		top: 3px;
		z-index: 1;
		opacity: .4;
	}
	@include when(checked) {
		border-color: #5495F6;
		background-color: #5495F6;
		@include element(content) {
			left: 7px;
		}
		@include element(inner) {
			left: 23px;
		}
		@include element(loading) {
			left: 25px;
		}
	}

}
</style>