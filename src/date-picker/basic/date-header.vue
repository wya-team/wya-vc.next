<template>
	<div class="vc-date-header">
		<template v-if="currentView !== 'timerange'">
			<vc-icon v-if="showPrev" class="vc-date-header__arrow is-prev is-prev-year" type="d-arrow-left" @click="handlePrevYear" />
			<vc-icon v-if="showPrev && isDate" class="vc-date-header__arrow is-prev" type="arrow-left" @click="handlePrevMonth" />
			<span class="vc-date-header__label" @click="handleShowYearPicker">{{ year }}</span>
			<span v-if="isDate" class="vc-date-header__label" @click="handleShowMonthPicker">{{ month }}</span>
			<vc-icon v-if="showNext" class="vc-date-header__arrow is-next is-next-year" type="d-arrow-right" @click="handleNextYear" />
			<vc-icon v-if="showNext && isDate" class="vc-date-header__arrow is-next" type="arrow-right" @click="handleNextMonth" />
		</template>
		<template v-else>
			<!-- 在面板为时间范围的时候才显示 -->
			<span>{{ title }}</span>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { Utils } from '@wya/utils';
import { prevYear, nextYear, prevMonth, nextMonth } from '../helper/date-utils';
import Icon from '../../icon/index';

export default defineComponent({
	name: 'vc-date-header',
	components: {
		'vc-icon': Icon,
	},
	props: {
		panelDate: Date,
		showNext: {
			type: Boolean,
			default: true
		},
		showPrev: {
			type: Boolean,
			default: true
		},
		currentView: String,
		title: String
	},
	emits: [
		'change-current-view',
		'change'
	],
	setup(props, { emit }) { 
		const year = computed(() => {
			return props.panelDate.getFullYear() + '年';
		});
		const month = computed(() => {
			let $month = props.panelDate.getMonth() + 1;
			return Utils.preZero($month) + '月';
		});
		const isDate = computed(() => {
			return ['date', 'daterange'].includes(props.currentView);
		});

		const handleShowYearPicker = () => {
			emit('change-current-view', 'year');
		};

		const handleShowMonthPicker = () => {
			emit('change-current-view', 'month');
		};

		const handlePrevMonth = () => {
			let prevM = prevMonth(props.panelDate);
			emit('change', prevM, 'prev-month');
		};

		const handlePrevYear = () => {
			let amount = props.currentView === 'year' ? 10 : 1;
			let prevY = prevYear(props.panelDate, amount);
			emit('change', prevY, 'prev-year');
		};

		const handleNextMonth = () => {
			let nextM = nextMonth(props.panelDate);
			emit('change', nextM, 'next-month');
		};

		const handleNextYear = () => {
			let amount = props.currentView === 'year' ? 10 : 1;
			let nextY = nextYear(props.panelDate, amount);
			emit('change', nextY, 'next-year');
		};

		return {
			year,
			month,
			isDate,
			handlePrevYear,
			handlePrevMonth,
			handleShowYearPicker,
			handleShowMonthPicker,
			handleNextYear,
			handleNextMonth
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-date-header;

@include block($block) {
	height: 32px;
	line-height: 32px;
	text-align: center;
	border-bottom: 1px solid #e8eaec;
	user-select: none;
	@include element(arrow) {
		display: inline-block;
		width: 20px;
		height: 24px;
		line-height: 26px;
		margin-top: 2px;
		font-size: 14px;
		text-align: center;
		cursor: pointer;
		color: #c5c8ce;
		vertical-align: unset;
		transition: color .2s ease-in-out;
		&:hover {
			color: #2D8CF0;
		}
		@include when(prev) {
			float: left;
		}
		@include when(prev-year) {
			margin-left: 10px;
		}
		@include when(next) {
			float: right;
		}
		@include when(next-year) {
			margin-right: 10px;
		}
	}
	@include element(label) {
		cursor: pointer;
		&:hover {
			color: #2D8CF0;
		}
	}
}
</style>
