export default {
	props: {
		name: String,
		label: {
			type: [String, Number],
			default: ''
		},

		// card大小
		width: {
			type: [Number, String],
			default: '70%'
		},

		// card之间间距, 或者滑动时候的间距
		gutter: {
			type: Number,
			default: 0
		},
		scale: {
			type: Number,
			default: 0.83
		} // card缩放
	}
};