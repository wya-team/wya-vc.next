import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed, shallowRef } from 'vue';
import Picker from '../picker';
import TimePanel from '../panel/time';
import TimeRangePanel from '../panel/time-range';
import usePicker from '../use-picker';

const getPanel = (type) => {
	const isRange = type === 'timerange';
	return isRange ? TimeRangePanel : TimePanel;
};
export default defineComponent({
	name: 'vc-time-picker',
	mixins: [Picker],
	props: {
		type: {
			type: String,
			default: 'time',
			validator: (v) => /(time|timerange)/.test(v)
		},
		disabledHours: {
			type: Array,
			default: () => {
				return [];
			}
		},
		disabledMinutes: {
			type: Array,
			default: () => {
				return [];
			}
		},
		disabledSeconds: {
			type: Array,
			default: () => {
				return [];
			}
		},
		hideDisabledOptions: {
			type: Boolean,
			default: false
		}
	},
	setup(props) {
		const icon = ref('icon');
		const panel = shallowRef({});
		const panelOptions = computed(() => {
			return {
				disabledHours: props.disabledHours,
				disabledMinutes: props.disabledMinutes,
				disabledSeconds: props.disabledSeconds,
				hideDisabledOptions: props.hideDisabledOptions,
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
			...usePicker()
		};
	}
});