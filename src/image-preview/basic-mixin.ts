import Core from './core';
import Customer from '../customer/index';
import Icon from '../icon/index';

export default {
	components: {
		'vc-customer': Customer,
		'vc-icon': Icon
	},
	props: {
		...Core.props,
		enhancer: Function,
		itemClassName: String,
		rowStyle: {
			type: Object,
			default: () => ({})
		}
	},
	emits: ['open', 'close']
};