<template>
	<div v-if="!isStyleless" :class="classes" class="vc-form-item">
		<div v-if="label || $slots.label" :for="labelFor" :style="labelStyle" class="vc-form-item__label">
			<label>
				<slot name="label">{{ label }}</slot>
			</label>
		</div>
		<div :style="contentStyle" class="vc-form-item__wrapper">
			<div class="vc-form-item__content">
				<slot />
				<vc-transition-fade>
					<div v-if="showError" class="vc-form-item__tip">
						{{ validateMessage }}
					</div>
				</vc-transition-fade>
			</div>
		</div>
	</div>
	<slot v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import basicFormItemMixin from './form-item-mixin';
import Transition from '../transition/index';
import useFormItem from './use-form-item';

export default defineComponent({
	name: 'vc-form-item',
	components: {
		'vc-transition-fade': Transition.Fade
	},
	mixins: [basicFormItemMixin],
	setup() {
		return useFormItem();
	}
});

</script>

<style lang='scss'>
@import '../style/vars.scss';

$block: vc-form-item;

@include block($block) {
	margin-bottom: 24px;
	line-height: 1.5;
	@include commonClearfix();
	@include element(content) { 
		position: relative;
		line-height: 28px;
		font-size: 12px
	} 
	@include element(label) { 
		text-align: right;
		vertical-align: middle;
		float: left;
		color: $c333;
		font-size: 12px;
		line-height: 28px;
		-webkit-box-sizing: border-box;
		box-sizing: border-box
	}
	/**
	 * -> vc-form-item.is_require
	 */
	& {
		@include when(require) {
			@include element(label) {
				&:before {
					content: '*';
					display: inline-block;
					margin-right: 4px;
					line-height: 1;
					font-family: SimSun;
					font-size: 12px;
					color: $error
				}
			}
		}
		/**
		 * 不使用is-error
		 * 影响v-if动画
		 */
		@include element(tip) {
			position: absolute;
			top: 100%;
			left: 0;
			line-height: 1;
			padding-top: 6px;
			color: $error;
		}
		@include when(left) {
			@include element(label) {
				text-align: left
			}
		}
		@include when(top) {
			@include element(label) {
				float: none;
				display: inline-block;
				padding: 0 0 10px 0
			}
		}
		/**
		 * 此模式下需要删除label
		 */
		@include when(inline) {
			display: inline-block;
			margin-right: 10px;
			vertical-align: top
		}
	}
	/**
	 * 嵌套管理
	 */
	@include block(vc-form-item) {
		margin-bottom: 0;
		@include element(wrapper, false) {
			margin-left: 0 !important;
		}
	}
}
</style>
