import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed, shallowRef } from 'vue';
import Picker from '../picker';
import DatePanel from '../panel/date';
import DateRangePanel from '../panel/date-range';
import QuarterRangePanel from '../panel/quarter-range';
import MonthRangePanel from '../panel/month-range';
import usePicker from '../use-picker';

const getPanel = (type) => {
	if (['daterange', 'datetimerange'].includes(type)) {
		return DateRangePanel;
	} else if (type === 'quarterrange') {
		return QuarterRangePanel;
	} else if (type === 'monthrange') {
		return MonthRangePanel;
	}
	return DatePanel;
};
export default defineComponent({
	name: 'vc-date-picker',
	mixins: [Picker],
	props: {
		type: {
			type: String,
			default: 'date',
			validator: (v) => /(year|month|quarter|date|daterange|datetime|datetimerange|quarterrange|monthrange)/.test(v)
		},
		options: {
			type: Object,
			default: (v) => ({})
		},
		timePickerOptions: {
			type: Object,
			default: (v) => ({})
		}
	},

	setup(props) {
		const icon = ref('date');
		const panel = shallowRef({});
		const panelOptions = computed(() => {
			return {
				...props.options,
				timePickerOptions: props.timePickerOptions
			};
		});

		watch(
			() => props.type,
			(v) => {
				panel.value = getPanel(v);
			},
			{ immediate: true }
		);

		return {
			icon,
			panel,
			panelOptions,
			...usePicker(),
		};
	}
});