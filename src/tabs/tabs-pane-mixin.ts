export default {
	props: {
		// TODO: 同时兼容value值
		name: {
			type: [String, Number]
		},
		label: {
			type: [String, Function],
			default: ''
		},
		/**
		 * 服务端渲染时，lazy设置为false，可以把内容渲染出来;
		 * 不能设置为!IS_SERVER, 会影响客服端激活，不一样会存在问题
		 */
		lazy: {
			type: Boolean,
			default: true
		}
	}
};