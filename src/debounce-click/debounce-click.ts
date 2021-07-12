import { h, defineComponent } from 'vue';
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
		const handleClick = (callback) => {
			const { wait } = props;
			if (callback) {
				return debounce(callback, wait * 1000, {
					leading: true,
					trailing: false
				});
			}
		};

		return () => {
			return h(props.tag, {
				...attrs,
				onClick: handleClick(attrs.onClick)
			}, slots.default?.());
		};
	}
});
