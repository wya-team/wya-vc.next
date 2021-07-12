<template>
	<div :class="inherit.class" :style="inherit.style" class="vcm-picker-popup">
		<vcm-popup 
			v-model="isActive" 
			v-bind="inherit.attrs" 
			:fixed="true"
			@close="handleClick('close')"
		>
			<div v-if="showToolbar" class="vcm-picker-popup__header">
				<div 
					v-if="cancelText" 
					class="vcm-picker-popup__item is-left"
					@click.stop="handleClick('cancel')"
				>
					{{ cancelText }}
				</div>

				<!-- title -->
				<div 
					class="vcm-picker-popup__item is-title"
					v-html="title"
				/>

				<div 
					v-if="okText" 
					class="vcm-picker-popup__item is-right" 
					@click.stop="handleClick('ok')"
				>
					{{ okText }}
				</div>
			</div>
			<slot />
		</vcm-popup>
	</div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue';
import { pick } from 'lodash';
import MPopup from '../../popup/index.m';
import { getSelectedData } from '../../utils/index';
import { useAttrs } from '../../hooks';

export default defineComponent({
	name: "vcm-picker-popup",
	components: {
		'vcm-popup': MPopup
	},
	inheritAttrs: false,
	props: {
		modelValue: {
			type: Boolean,
			default: true
		},
		title: {
			type: String,
			default: ''
		},
		cancelText: {
			type: String,
			default: '取消'
		},
		okText: {
			type: String,
			default: '确定'
		},
		showToolbar: {
			type: Boolean,
			default: true
		}
	},
	emits: ['update:modelValue', 'visible-change', 'close', 'cancel', 'ok'],
	setup(props, context) {
		const { emit } = context;
		const its = useAttrs({ standard: false });
		const isActive = ref(false);

		const inherit = computed(() => {
			return {
				style: its.value.style,
				class: its.value.class,
				attrs: its.value.attrs
			};
		});

		watch(
			() => props.modelValue,
			(v) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		watch(
			() => isActive.value,
			(v) => {
				emit('visible-change', v);
				emit('update:modelValue', v);
			}
		);

		const handleClick = (event) => {
			isActive.value = false;
			emit(event);
		};

		return {
			inherit,
			isActive,
			handleClick
		};
	}
});

</script>

<style lang='scss'>
@import '../../style/vars.scss';

@include block(vcm-picker-popup) {
	@include element(header) {
		position: relative;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		background-color: #fff;
		@include commonBorder1PX(bottom, #e7e7e7);
	}
	@include element(item) {
		padding: 0 15px;
		color: #108ee9;
		height: 44px;
		font-size: 17px;
		line-height: 44px;
		@include when(title) {
			flex: 1;
			text-align: center;
			color: #000;
		}
	}
	
}
</style>
