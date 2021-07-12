<template>
	<div class="vc-time-select">
		<div :ref="setRef('hours')" class="vc-time-select__list">
			<ul class="vc-time-select__ul">
				<li 
					v-for="(item, index) in hoursList" 
					v-show="!item.hide"
					:key="index" 
					:class="getCellClasses(item)"
					class="vc-time-select__li"
					@click="handleClick('hours', item)"
				>
					{{ preZero(item.text) }}
				</li>
			</ul>
		</div>
		<div :ref="setRef('minutes')" class="vc-time-select__list">
			<ul class="vc-time-select__ul">
				<li 
					v-for="(item, index) in minutesList" 
					v-show="!item.hide" 
					:key="index" 
					:class="getCellClasses(item)"
					class="vc-time-select__li"
					@click="handleClick('minutes', item)"
				>
					{{ preZero(item.text) }}
				</li>
			</ul>
		</div>
		<div v-show="showSeconds" :ref="setRef('seconds')" class="vc-time-select__list">
			<ul class="vc-time-select__ul">
				<li 
					v-for="(item, index) in secondsList" 
					v-show="!item.hide" 
					:key="index" 
					:class="getCellClasses(item)"
					class="vc-time-select__li"
					@click="handleClick('seconds', item)"
				>
					{{ preZero(item.text) }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed, reactive } from 'vue';
import { $, Utils } from '@wya/utils';
import _ from 'lodash';
import { clearTime, getDateOfTime } from '../helper/date-utils';

export default defineComponent({
	name: 'vc-time-select',
	props: {
		hours: {
			type: [Number, String],
			default: NaN
		},
		minutes: {
			type: [Number, String],
			default: NaN
		},
		seconds: {
			type: [Number, String],
			default: NaN
		},
		showSeconds: {
			type: Boolean,
			default: true
		},
		steps: {
			type: Array,
			default: () => []
		},
		disabledHours: {
			type: Array,
			default() {
				return [];
			}
		},
		disabledMinutes: {
			type: Array,
			default() {
				return [];
			}
		},
		disabledSeconds: {
			type: Array,
			default() {
				return [];
			}
		},
		disabledTime: Function,
		panelDate: Date,
		hideDisabledOptions: {
			type: Boolean,
			default: false
		}
	},
	emits: ['pick'],
	setup(props, { emit }) {
		const spinerSteps = ref([1, 1, 1].map((one, i) => Math.abs(props.steps[i]) || one));
		const compiled = ref(false);
		const isFirst = ref(false);
		const focusedColumn = ref(-1);
		const focusedTime = ref([0, 0, 0]); // [hh, mm, ss]
		const refs = reactive({});
		const setRef = key => el => {
			if (el) {
				refs[key] = el;
			}
		};

		const getHoursDisabledStatus = (hours) => {
			if (typeof props.disabledTime !== 'function') return;
			const date = new Date(props.panelDate);
			const panelDate = clearTime(date);
			const startTime = { hours, minutes: 0, seconds: 0 };
			const endTime = { hours, minutes: 59, seconds: 59 };
			const startDate = getDateOfTime(panelDate, startTime);
			const endDate = getDateOfTime(panelDate, endTime);
			return props.disabledTime(startDate) && props.disabledTime(endDate); 
		};

		const getMinutesDisabledStatus = (minutes) => {
			if (typeof props.disabledTime !== 'function') return;
			const date = new Date(props.panelDate);
			const panelDate = clearTime(date);
			const startTime = { hours: date.getHours(), minutes, seconds: 0 };
			const endTime = { hours: date.getHours(), minutes, seconds: 59 };
			const startDate = getDateOfTime(panelDate, startTime);
			const endDate = getDateOfTime(panelDate, endTime);
			return props.disabledTime(startDate) && props.disabledTime(endDate); 
		};

		const getSecondsDisabledStatus = (seconds) => {
			if (typeof props.disabledTime !== 'function') return;
			const date = new Date(props.panelDate);
			const panelDate = clearTime(date);
			const startTime = { hours: date.getHours(), minutes: date.getMinutes(), seconds };
			const startDate = getDateOfTime(panelDate, startTime);
			return props.disabledTime(startDate); 
		};

		const handleClick = (type, cell) => {
			if (cell.disabled) return;
			const data = { [type]: cell.text };
			isFirst.value = false;
			emit('pick', data);
		};

		const getCellClasses = (cell) => {
			let classes = [];

			if (cell.selected) classes.push('is-selected');
			if (cell.disabled) { classes.push('is-disabled'); }
			if (cell.focused) { classes.push('is-focused'); }

			// TODO 其他情况的样式
			return classes.join(' ');
		};

		const getScrollIndex = (type, index) => {
			const Type = _.startCase(type);
			const disabled = props[`disabled${Type}`];
			if (disabled.length && props.hideDisabledOptions) {
				let _count = 0;
				disabled.forEach(item => (item <= index ? _count++ : ''));
				index -= _count;
			}
			return index;
		};

		const scroll = (type, index) => {
			const from = refs[type].scrollTop;
			const to = 24 * getScrollIndex(type, index);
			$(refs[type]).scrollIntoView({
				from, 
				to, 
				duration: isFirst.value ? 0 : 500, // 首次展示时不执行滚动动画
			});
		};

		const hoursList = computed(() => {
			let hours = [];
			const step = spinerSteps.value[0];
			const focusedHour = props.focusedColumn === 0 && focusedTime.value[0];
			const hourTmpl = {
				text: 0,
				selected: false,
				disabled: false,
				hide: false
			};
			for (let i = 0; i < 24; i += step) {
				const hour = { ...hourTmpl };
				hour.text = i;
				hour.focused = i === focusedHour;
				if (
					(props.disabledHours.length && props.disabledHours.includes(i)) 
					|| getHoursDisabledStatus(i)
				) {
					hour.disabled = true;
					if (props.hideDisabledOptions) hour.hide = true;
				}
				if (props.hours === i) hour.selected = true;
				hours.push(hour);
			}
			return hours;
		});

		const minutesList = computed(() => {
			let minutes = [];
			const step = spinerSteps.value[1];
			const focusedMinute = props.focusedColumn === 1 && focusedTime.value[1];
			const minuteTmpl = {
				text: 0,
				selected: false,
				disabled: false,
				hide: false
			};
			for (let i = 0; i < 60; i += step) {
				const minute = { ...minuteTmpl };
				minute.text = i;
				minute.focused = i === focusedMinute;
				if (
					(props.disabledMinutes.length && props.disabledMinutes.includes(i))
					|| getMinutesDisabledStatus(i)
				) {
					minute.disabled = true;
					if (props.hideDisabledOptions) minute.hide = true;
				}
				if (props.minutes === i) minute.selected = true;
				minutes.push(minute);
			}
			return minutes;
		});

		const secondsList = computed(() => {
			let seconds = [];
			const step = spinerSteps.value[2];
			const focusedMinute = props.focusedColumn === 2 && focusedTime.value[2];
			const secondTmpl = {
				text: 0,
				selected: false,
				disabled: false,
				hide: false
			};
			for (let i = 0; i < 60; i += step) {
				const second = { ...secondTmpl };
				second.text = i;
				second.focused = i === focusedMinute;
				if (
					(props.disabledSeconds.length && props.disabledSeconds.includes(i))
					|| getSecondsDisabledStatus(i)
				) {
					second.disabled = true;
					if (props.hideDisabledOptions) second.hide = true;
				}
				if (props.seconds === i) second.selected = true;
				seconds.push(second);
			}
			return seconds;
		});



		[
			['hours', hoursList], 
			['minutes', minutesList], 
			['seconds', secondsList]
		].forEach((item) => {
			watch(
				() => props[item[0]],
				(v) => {
					if (!compiled.value) return;
					scroll(item[0], item[1].findIndex(obj => { return obj.text == v; }));
				}
			);
		});

		return {
			spinerSteps,
			compiled,
			hoursList,
			minutesList,
			secondsList,
			setRef,
			preZero: Utils.preZero,
			getCellClasses,
			handleClick
		};
	} 
	
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-time-select;

@include block($block) {
	display: flex;
	font-size: 14px;
	@include element(list) {
		width: 56px; // time-picker
		max-height: 144px;
		overflow: hidden;
		border-left: 1px solid #e8eaec;
		position: relative;
		&:hover {
			overflow-y: auto;
		}
		ul {
			width: 100%;
			margin: 0;
			padding: 0 0 120px;
			list-style: none;
			li {
				width: 100%;
				height: 24px;
				line-height: 24px;
				margin: 0;
				padding: 0 0 0 16px;
				box-sizing: content-box;
				text-align: left;
				-webkit-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
				cursor: pointer;
				list-style: none;
				transition: background .2s ease-in-out;
			}
		}
	}
	@include element(li) {
		&:hover {
			background: #f3f3f3;
		}
		@include when(selected) {
			color: #2d8cf0;
			background: #f3f3f3;
			&:hover {
				color: #2d8cf0;
				background: #f3f3f3;
			}
		}
		@include when(disabled) {
			color: #c5c8ce;
			cursor: not-allowed;
		}
		@include when(focused) {
			background-color: #d5e8fc;
		}
	}
}
</style>
