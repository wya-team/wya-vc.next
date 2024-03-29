<template>
	<div :style="{ paddingLeft: `${indent}px`}" class="vcm-form-item">
		<div :class="classes" class="vcm-form-item__wrapper">
			<label v-if="label || $slots.label" :for="labelFor" :style="labelStyle" class="vcm-form-item__label">
				<slot name="label">{{ label }}</slot>
			</label>
			<div :style="contentStyle" class="vcm-form-item__content">
				<slot />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import basicFormItemMixin from '../form-item-mixin';
import useFormItem from '../use-form-item';

export default defineComponent({
	name: 'vcm-form-item',
	mixins: [basicFormItemMixin],
	props: {
		indent: {
			type: Number,
			default: 12
		}
	},

	setup() {
		return useFormItem();
	}
});

</script>

<style lang='scss'>
@import '../../style/vars.scss';
$block: vcm-form-item;

@include block($block) {
	@include element(wrapper) {
		padding-top: 12px;
		padding-bottom: 12px;
		padding-right: 12px;
		@include commonBorder1PX(bottom);
	}
	@include pseudo(last-child) {
		@include element(wrapper) {
			&:after {
				display: none
			}
		}
	}
	@include element(content) { 
		position: relative;
		font-size: 16px;
		line-height: 24px;
	} 
	@include element(label) { 
		text-align: right;
		vertical-align: middle;
		float: left;
		color: #000;
		font-size: 16px;
		line-height: 24px;
		box-sizing: border-box;
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
	}
}

</style>
