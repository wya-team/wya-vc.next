export default {
	props: {
		value: String,
		tag: {
			type: [String, Object, Function],
			default: 'div'
		}
	}
};
