<template>
	<div class="vc-date-shortcuts">
		<ul class="vc-date-shortcuts__ul">
			<li
				v-for="(item, index) in config"
				:key="index"
				class="vc-date-shortcuts__li"
				@click="handleSelect(item)"
			>
				{{ item.text }}
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Utils } from '@wya/utils';
import { prevYear, nextYear, prevMonth, nextMonth } from '../helper/date-utils';

export default {
	name: 'vc-shortcuts-select',
	props: {
		panelDate: Date,
		config: Array,
		value: Date
	},
	emits: ['pick'],
	setup(props, { emit }) {
		const handleSelect = ({ value, onClick }) => {
			if (typeof value != 'function' && !onClick) {
				throw Error('【vc-date-picker】:options[value]需要是一个方法');
			}
			if (value) {
				emit('pick', value());
			}
			onClick && onClick();
		};

		return {
			handleSelect
		};
	}
};
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-date-shortcuts;

@include block($block) {
	height: 100%;
	background: $cf8;
	border-right: 1px solid #e8eaec;
	@include element(ul) {
		list-style: none;
		@include element(li) {
			padding: 6px 16px;
			cursor: pointer;
			transition: .2s;
			&:hover {
				background: #e4e7e9;
			}
		}
	}
}
</style>
