import { h, defineComponent, ref, shallowRef, getCurrentInstance, onBeforeMount, onMounted, onUnmounted, watch } from 'vue';
import { debounce } from 'lodash';
import { EVENTS } from './constants';
import { Resize } from '../utils/resize';

export default defineComponent({
	name: "vc-echarts",
	props: {
		styles: {
			type: Object,
			required: false,
			default: () => ({
				width: '100%',
				height: '100%'
			})
		},
		options: Object,
		theme: [String, Object],
		initOptions: Object,
		group: String,
		autoResize: Boolean,
		watchShallow: Boolean,
		manualUpdate: Boolean
	},
	emits: [
		...EVENTS,
		'ready'
	],
	setup(props, { emit }) {
		const instance = getCurrentInstance();

		const chart = shallowRef(null);
		const echartsInstance = shallowRef(null);
		const manualOptions = shallowRef(null);

		let resizeHandler;
		let lastArea = 0;

		const getArea = () => {
			return instance.vnode.el.offsetWidth * instance.vnode.el.offsetHeight;
		};

		const mergeOptions = (options, notMerge, lazyUpdate) => {
			if (props.manualUpdate) {
				manualOptions.value = options;
			}

			if (!chart.value) return;
			chart.value.setOption(options, notMerge, lazyUpdate);
		};

		const init = () => {
			if (chart.value || !echartsInstance.value) {
				return;
			}

			chart.value = echartsInstance.value.init(instance.vnode.el, props.theme, props.initOptions);
			if (props.group) {
				chart.value.group = props.group;
			}

			chart.value.setOption(manualOptions.value || props.options || {}, true);

			// expose ECharts events as custom events
			EVENTS.forEach(event => {
				chart.value.on(event, params => {
					emit(event, params);
				});
			});

			if (props.autoResize) {
				lastArea = getArea();
				resizeHandler && Resize.off(instance.vnode.el, resizeHandler);
				resizeHandler = debounce(() => {
					if (lastArea === 0) {
						// emulate initial render for initially hidden charts
						mergeOptions({}, true);
						chart.value.resize();
						mergeOptions(props.options || manualOptions.value || {}, true);
					} else {
						chart.value.resize();
					}
					lastArea = getArea();
				}, 100, { leading: true });

				Resize.on(instance.vnode.el, resizeHandler);
			}
		};

		const destroy = () => {
			if (!chart.value) return;

			if (props.autoResize) {
				resizeHandler && Resize.off(instance.vnode.el, resizeHandler);
				resizeHandler = null;
			}
			chart.value.dispose();
			chart.value = null;
		};

		const refresh = () => {
			if (!chart.value) return;

			destroy();
			init();
		};

		watch(
			() => props.group,
			(v) => {
				chart.value && (chart.value.group = v);
			}
		);

		if (!props.manualUpdate) {
			watch(
				() => props.options, 
				(val, oldVal) => {
					console.log(props.options);
					if (!chart.value && val) {
						init();
					} else {
						chart.value.setOption(val, val !== oldVal);
					}
				}, 
				{ deep: !props.watchShallow }
			);
		}

		let watched = ['theme', 'initOptions', 'autoResize', 'manualUpdate', 'watchShallow'];
		watched.forEach(prop => watch(() => props[prop], refresh, { deep: true }));

		onMounted(async () => {
			let echarts = window.echarts || await import('echarts');
			// 兼容webpack 3.0/4.0 写法
			echartsInstance.value = echarts.default ? echarts.default : echarts;

			props.options && init();

			emit('ready', {
				instance: chart.value,
				dependencies: {
					echarts: echartsInstance.value
				}
			});
		});

		onUnmounted(destroy);

		return {
			chart,
			echartsInstance
		};
	},

	render() {
		let { styles } = this;
		return h('div', {
			class: 'vc-echarts',
			style: styles
		}, this.$slots.default?.());
	},
});