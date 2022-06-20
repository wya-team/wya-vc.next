<template>
	<li 
		:class="classes" 
		class="vc-dropdown-item" 
		@click="handleClick"
	>
		<slot />
	</li>
</template>

<script lang="ts">
import { defineComponent, computed, inject, getCurrentInstance } from 'vue';
import { getInstance } from '../hooks';

export default defineComponent({
	name: 'vc-dropdown-item',
	props: {
		value: {
			type: [String, Number],
			value: undefined
		},
		name: {
			type: [String, Number],
			value: undefined
		},
		disabled: {
			type: Boolean,
			default: false
		},
		selected: {
			type: Boolean,
			default: false
		},
		divided: {
			type: Boolean,
			default: false
		},
		closable: {
			type: Boolean,
			default: true
		}
	},
	emits: ['click'],
	setup(props, context) {
		const { emit } = context;
		const instance = getCurrentInstance();
		const owner = getInstance('dropdown', 'dropdownId');

		const currentValue = computed(() => {
			const v = typeof props.value === 'undefined' || props.value === ''
				? props.name
				: props.value;

			return v;
		});

		const classes = computed(() => {
			return {
				'is-selected': props.selected,
				'is-divided': props.divided,
				'is-disabled': props.disabled
			};
		});

		const handleClick = (e) => {
			if (props.disabled) return;

			emit('click', currentValue.value, e);
			owner.emit('click', currentValue.value, e);

			props.closable && owner.proxy.close();
		};

		return {
			classes,
			currentValue,
			handleClick
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-dropdown-item;

@include block($block) {
	position: relative;
	margin: 0;
	line-height: normal;
	padding: 7px 16px;
	clear: both;
	color: #666;
	font-size: 12px !important;
	white-space: nowrap;
	list-style: none;
	cursor: pointer;
	transition: background .2s ease-in-out;
	&:hover {
		background-color: #e6f7ff;
		color: #5495f6;
	}
	@include when(disabled) {
		color: #c5c8ce;
		cursor: not-allowed;
		&:hover {
			background-color: #fff;
		}
	}
	@include when(selected) {
		color: #5495f6;
	}
	@include when(divided) {
		margin-top: 5px;
		@include commonBorder1PX('top', #e8eaec)
	}
}
</style>
