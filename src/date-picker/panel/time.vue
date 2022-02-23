<template>
	<div class="vc-time-panel">
		<vc-time-select 
			:hours="timeSlots[0]"
			:minutes="timeSlots[1]"
			:seconds="timeSlots[2]"
			:disabled-hours="disabledHours"
			:disabled-minutes="disabledMinutes"
			:disabled-seconds="disabledSeconds"
			:hide-disabled-options="hideDisabledOptions"
			:show-seconds="showSeconds"
			:steps="steps"
			@pick="handlePick"
		/>
		<vc-date-confirm 
			v-if="confirm"
			:show-time="false"
			current-view="time"
			@clear="handleClear"
			@ok="handleOK"
		/>
	</div>
</template>

<script>
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed } from 'vue';
import { getDateOfTime, clearTime } from '../helper/date-utils';
import TimeMixin from '../mixins/time';
import Confirm from '../basic/confirm';
import TimeSelect from '../basic/time-select';
import useReady from '../use-ready';

export default defineComponent({
	name: 'vc-time-panel',
	components: {
		'vc-date-confirm': Confirm,
		'vc-time-select': TimeSelect
	},
	mixins: [TimeMixin],
	emits: [
		'pick',
		'clear',
		'ok'
	],
	setup(props, { emit }) {
		const isReady = useReady();
		const dates = ref(props.value);

		const showSeconds = computed(() => {
			return !(props.format || '').match(/mm$/);
		});
		const timeSlots = computed(() => {
			let date = dates.value[0];
			if (!date || !isReady.value) return [];
			return [date.getHours(), date.getMinutes(), date.getSeconds()];
		});

		const handlePick = (value) => {
			// TODO confirm为false 不能实时响应，但不关闭弹层
			let date = dates.value[0] || clearTime(new Date());
			let newDate = getDateOfTime(date, value);
			dates.value = [newDate];
			emit('pick', dates.value);
		};

		const handleClear = () => {
			emit('clear');
		};

		const handleOK = () => {
			emit('ok', dates.value);
		};

		return {
			dates,
			showSeconds,
			timeSlots,
			handlePick,
			handleClear,
			handleOK
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-time-panel;

@include block($block) {
}
</style>
