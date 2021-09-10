<template>
	<div class="vc-calendar">
		<slot
			:data="{ month: monthNames[currentMonth][lang], year: currentYear }" 
			name="month" 
		>
			<vc-customer
				:month="currentMonth"
				:year="currentYear"
				:month-names="monthNames"
				:render="renderMonth"
				:lang="lang"
			/>
		</slot>
		<transition-group :name="`vc-calendar__${slideMode}`">
			<div :key="currentMonth" class="vc-calendar__content">
				<slot
					:date="weekNames.map((item) => item[lang])" 
					name="week" 
				>
					<vc-customer
						:render="renderWeek"
						:week-names="weekNames"
						:lang="lang"
					/>
				</slot>
				<div>
					<div v-for="i in 6" :key="i" class="vc-calendar-row">
						<span
							v-for="(item, index) in dateArr.data.slice((i - 1) * 7, (i - 1) * 7 + 7)"
							:key="index"
							:class="`vc-calendar-row__item is-${item.type}`"
						>
							<slot
								:date="item" 
								:formatter-date="formatterDate"
								:holiday="date2holiday(item.date)"
							>
								<vc-customer
									:date="item"
									:formatter-date="formatterDate"
									:holiday="date2holiday(item.date)"
									:render="renderDate"
								/>
							</slot>
						</span>
					</div>
				</div>
			</div>
		</transition-group>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Utils } from "@wya/utils";
import Customer from "../customer";
import date2holiday from "./date2holiday";
import { monthNames, weekNames } from './constants';
import { defaultRenderDate, defaultRenderMonth, defaultRenderWeek } from './components';
import { getCurrentInfo } from './utils';

export default defineComponent({
	name: "vc-calendar",
	components: {
		'vc-customer': Customer,
	},
	props: {
		renderMonth: {
			type: Function,
			default: defaultRenderMonth
		},
		renderWeek: {
			type: Function,
			default: defaultRenderWeek
		},
		renderDate: {
			type: Function,
			default: defaultRenderDate
		},
		lang: {
			type: String,
			default: "ch"
		},
		monthNames: {
			type: Array,
			default: () => monthNames
		},
		weekNames: {
			type: Array,
			default: () => weekNames
		}
	},
	setup() {
		const now = new Date();

		const currentDate = ref(now);
		const currentMonth = ref(now.getMonth()); // 要展示的月份 0-11
		const currentYear = ref(now.getFullYear()); // 要展示的年份
		const slideMode = ref("left");
		const toggle = ref(true);

		const next = () => {
			slideMode.value = "left";
			toggle.value = !toggle.value;
			if (currentMonth.value === 11) {
				currentMonth.value = 0;
				currentYear.value++;
			} else {
				currentMonth.value++;
			}
		};

		const prev = () => {
			slideMode.value = "right";
			toggle.value = !toggle.value;
			if (currentMonth.value === 0) {
				currentMonth.value = 11;
				currentYear.value--;
			} else {
				currentMonth.value--;
			}
		};

		const dateArr = computed(() => {
			return getCurrentInfo(currentYear.value, currentMonth.value + 1);
		});

		const formatterDate = computed(() => {
			return `${currentDate.value.getFullYear()}-${Utils.preZero(currentDate.value.getMonth() + 1)}-${Utils.preZero(
				currentDate.value.getDate()
			)}`;
		});

		return {
			currentDate,
			currentMonth,
			currentYear,
			slideMode,
			toggle,
			dateArr,
			formatterDate,

			date2holiday,

			prev,
			next
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-calendar;

@include block($block) {
	width: 100%;
	position: relative;
	overflow: hidden;
	@include element(month) {
		@include commonFlexCc();
		line-height: 60px;
		font-size: 24px;
		background-color: #f5f6f7;
		color: #2e3136;
	}
	@include element(week) {
		@include commonFlex();
		width: 100%;
		align-items: center;
		color: gray;
		padding: 15px 0;
		font-size: 16px;
		@include spec-selector('>') {
			span {
				width: 14.28%;
				text-align: center;
			}
		}
	}
	@include element(content) {
		width: 100%;
		transition: all .3s;
		position: relative;
		z-index: 0;
	}
	@include block(vc-calendar-row) {
		@include commonFlex();
		@include element(item) {
			@include commonFlexCc();
			flex:1 ;
			font-size: 16px;
			span {
				@include when(selected) {
					@include commonFlexCc();
					width: 40px;
					height: 40px;
					border-radius: 20px;
					background-color: #2f75ef;
					color: #fff;
					box-shadow: 1px 2px 10px #2f8aef;
				}
			}
			@include when(prev) {
				color: lightgray;
			}
			@include when(next) {
				color: lightgray;
			}
		}
	}
}

.vc-calendar__right-leave-active,
.vc-calendar__left-leave-active {
	position: absolute !important;
}
.vc-calendar__right-leave-to,
.vc-calendar__left-enter {
	transform: translateX(100%);
}
.vc-calendar__right-enter,
.vc-calendar__left-leave-to {
	transform: translateX(-100%);
}
</style>