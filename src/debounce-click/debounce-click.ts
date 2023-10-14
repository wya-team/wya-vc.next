import { h, defineComponent, computed } from 'vue';
import { debounce } from 'lodash';

export default defineComponent({
	name: "vc-debounce-click",
	// 控制tag自定义时能传递参数
	inheritAttrs: false,
	props: {
		wait: {
			type: Number,
			default: 0.25
		},
		tag: {
			type: [String, Object, Function],
			default: 'div'
		}
	},
	setup(props, { slots, attrs }) {
		const handler = computed(() => {
			const { wait } = props;
			const callback = attrs.onClick;
			if (callback) {
				return debounce(callback as any, wait * 1000, {
					leading: true,
					trailing: false
				});
			}
			return () => {};
		});

		return () => {
			return h(props.tag, {
				...attrs,
				onClick: handler.value
			}, slots.default?.());
		};
	}
});
