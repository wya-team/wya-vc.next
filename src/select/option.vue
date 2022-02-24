<template>
	<div
		v-if="isActive"
		:disabled="disabled && 'disabled'"
		:class="{ 'is-select': isSelect, 'is-last': isLast }"
		class="vc-select-option"
		@click.stop="handleSelect"
		@mousedown.prevent
	>
		<slot>{{ formatterLabel }}</slot>
		<vc-icon v-if="isSelect" type="correct" />
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, inject, computed } from 'vue';
import Icon from '../icon';
import { getInstance } from '../hooks';

export default defineComponent({
	name: 'vc-select-option',
	components: {
		'vc-icon': Icon
	},
	props: {
		value: {
			type: [String, Number],
			required: true
		},
		label: {
			type: [String, Number]
		},
		disabled: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否可过滤
		 */
		filterable: {
			type: Boolean,
			default: true
		}
	},
	setup(props, context) {
		const { slots } = context;
		const instance = getCurrentInstance();
		const owner = getInstance('select', 'selectId');

		const formatterLabel = computed(() => {
			let v = String(
				(slots.default && slots.default()[0].children) 
				|| props.label 
				|| props.value
			);
			return v.trim();
		});

		const isSelect = computed(() => {
			const { modelValue, multiple } = owner.props;
			if (typeof modelValue !== 'undefined' || modelValue === '') return;
			return !multiple
				? modelValue == props.value
				: modelValue.includes(props.value);
		});

		const isLast = computed(() => {
			const { modelValue, multiple } = owner.props;
			return !multiple ? true : modelValue.slice(-1)[0] === props.value;
		});

		const isActive = computed(() => {
			return owner.proxy.searchRegex.test(formatterLabel.value) || !props.filterable;
		});

		const handleSelect = () => {
			// 禁止操作
			if (props.disabled) return;
			// 已选中，弹层关闭
			if (!owner.props.multiple && isSelect.value) {
				owner.proxy.close();
				return;
			} else if (isSelect.value) {
				owner.proxy.remove(props.value, formatterLabel.value);
				return;
			}
			owner.proxy.add(props.value, formatterLabel.value);
		};

		return {
			formatterLabel,
			isSelect,
			isLast,
			isActive,
			handleSelect
		};	
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';

$block: vc-select-option;

@include block($block) {
	display: flex;
	justify-content: space-between;
	align-items: center;
	line-height: normal;
	padding: 7px 16px;
	color: #666;
	font-size: 12px!important;
	white-space: nowrap;
	cursor: pointer;
	&:hover {
		background-color: #e6f7ff;
	}
	@include when(select) {
		background-color: #fff;
		color: #5495f6;
		.vc-icon {
			color: #5495f6;
		}
		@include when(last) {
			background-color: #e6f7ff;
		}
	}
	
	&[disabled="disabled"] {
		color: #c5c8ce;
		cursor: not-allowed;
		pointer-events: none;
	}
}
</style>
