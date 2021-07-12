import { h, defineComponent, computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Utils } from "@wya/utils";
import { debounce } from 'lodash';
import Customer from "../customer";

const getTimestamp = (date) => {
	if (date instanceof Date) {
		return date.getTime();
	} else if (typeof date === 'string') {
		return Date.parse(date.replace(/-/g, "/"));
	} else if (date.toString().length === 10) {
		return date * 1000;
	}
	return date;
};

const formatter = (format, arr) => {
	// YYYY,MM
	return format
		.replace('DD', arr[0])
		.replace('HH', arr[1])
		.replace('mm', arr[2])
		.replace('ss', arr[3])
		.replace('ms', arr[4]);
};

export default {
	name: "vc-countdown",
	props: {
		showZero: {
			type: Boolean,
			default: true
		},
		tag: {
			type: String,
			default: "span"
		},
		// 只能是String, 函数使用formatter
		format: {
			type: String,
			default: "DD天HH小时mm分ss秒ms"
		},
		t: {
			type: Number,
			default: 1
		},
		targetTime: {
			type: [String, Number, Date],
			default: ""
		},
		serverTime: {
			type: [String, Number, Date],
			default: ""
		},
		renderRow: Function
	},
	emits: ['change', 'end'],
	setup(props, context) {
		const { emit, slots } = context;
		const days = ref("");
		const hours = ref("");
		const minutes = ref("");
		const seconds = ref("");
		const mseconds = ref("");

		// 周期
		const T = computed(() => {
			return props.t * 1000;
		});
		// 毫秒被除数
		const msDividend = computed(() => {
			if (props.t < 0.01) {
				return 1000;
			} else if (props.t < 0.1) {
				return 100;
			} else {
				return 10;
			}
		});
		// 偏移值
		const serverOffset = computed(() => {
			return props.serverTime 
				? (getTimestamp(props.serverTime) - (new Date()).getTime()) 
				: 0;
		});
		// 目标时间
		const targetTimestamp = computed(() => {
			if (!props.targetTime && getTimestamp(props.targetTime)) {
				emit("error", '请设定时间以及格式');
				return null;
			}

			return getTimestamp(props.targetTime);
		});

		const result = computed(() => {
			if (props.renderRow) {
				return;
			}
			let v;
			let day = days.value;
			let hour = hours.value;
			let minute = minutes.value;
			let second = seconds.value;
			let ms = mseconds.value;

			v = formatter(props.format, [day, hour, minute, second, ms]);
			

			// 过来00*
			if (!props.showZero) {
				let regex = new RegExp(
					`00(${formatter(props.format, Array.from({ length: 5 }, () => '|'))})?`, 
					'g'
				);
				v = v.replace(regex, '');
			}

			return v;
		});


		let timer;
		const run = () => {
			const currentTime = new Date((new Date()).getTime() + serverOffset.value);
			const timestamp = targetTimestamp.value - currentTime;

			const _second = 1000;
			const _minute = _second * 60;
			const _hour = _minute * 60;
			const _day = _hour * 24;

			days.value = Utils.preZero(Math.floor(timestamp / _day));
			hours.value = Utils.preZero(Math.floor((timestamp % _day) / _hour));
			minutes.value = Utils.preZero(Math.floor((timestamp % _hour) / _minute));
			seconds.value = Utils.preZero(Math.floor((timestamp % _minute) / _second));
			mseconds.value = Math.floor(timestamp % 1000 / (1000 / msDividend.value)); // msDividend越小，取的毫秒级的位数应该越大

			if (timestamp <= 0) {
				stop();

				emit("change", {
					timestamp: 0,
					days: '00',
					hours: '00',
					minutes: '00',
					seconds: '00',
					ms: '00',
				});

				emit("end");
			} else {
				emit("change", {
					timestamp,
					days: days.value,
					hours: hours.value,
					minutes: minutes.value,
					seconds: seconds.value,
					ms: mseconds.value,
				});

			}
		};

		const start = () => {
			if (targetTimestamp.value) {
				timer && clearInterval(timer);
				timer = setInterval(run, T.value);
			}
		};

		const stop = () => {
			timer && clearInterval(timer);
		};

		const restart = debounce(() => {
			stop();
			start();
		}, 200, { leading: true }); 

		watch(() => props.targetTime, restart);
		watch(() => props.serverTime, restart);

		onMounted(start);
		onBeforeUnmount(stop);

		return () => {
			if (slots.default) {
				return h(
					props.tag, 
					{ class: "vc-countdown" },
					slots.default({
						days: days.value,
						hours: hours.value,
						minutes: minutes.value,
						seconds: seconds.value,
						ms: mseconds.value,
						format: props.format,
						tag: props.tag,
						showZero: props.showZero,
					})
				);
			} else if (props.renderRow) {
				return h(
					Customer, 
					{ 
						class: "vc-countdown",
						render: props.renderRow,
						days: days.value,
						hours: hours.value,
						minutes: minutes.value,
						seconds: seconds.value,
						ms: mseconds.value,
						format: props.format,
						tag: props.tag,
						showZero: props.showZero,
					},
				);
			} else {
				return h(props.tag, { 
					class: "vc-countdown",
					innerHTML: result.value
				});
			}
		};

	}
};

