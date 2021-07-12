export default {
	/**
	 * 注意: vue@3.0.x 以下要写组件中
	 * https://github.com/vuejs/vue-next/pull/3742
	 */
	inheritAttrs: false,
	props: {
		/**
		 * 进入/离开持续时间
		 * {enter: .3, leave: .3}
		 */
		duration: {
			type: [Number, Object],
			default: 0.3
		},
		/**
		 * 进入/离开延迟时间
		 */
		delay: {
			type: [Number, Object],
			default: 0
		},
		/**
		 * `transition-group` component.
		 */
		group: Boolean,
		/**
		 * `transition-group` tag, v3版本默认值无
		 */
		tag: {
			type: String,
			default: undefined
		},
		/**
		 *  变换的初始位置, 可以用style代替, 更短~~
		 */
		origin: {
			type: String,
			default: ''
		},
		/**
		 * 在转换期间应用的元素样式。这些样式应用于@beforeEnter和@beforeLeave钩子
		 */
		styles: {
			type: Object,
			default: () => {
				return {
					animationFillMode: 'both',
					animationTimingFunction: 'ease-out'
				};
			}
		},
		prefix: {
			type: String,
			default: ''
		}
	}
};