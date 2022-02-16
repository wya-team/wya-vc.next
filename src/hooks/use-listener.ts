/**
 * useAttrs再多层次嵌套下listeners会丢失，可能和inheritAttrs：false
 * 此方法仅提取listener
 */
import {
	getCurrentInstance,
	ref,
	watchEffect
} from 'vue';
import { kebabCase, camelCase } from 'lodash';

export const useListeners = (options: Options = {}) => {
	const { exclude = [] } = options;
	const instance = getCurrentInstance();
	const listeners = ref({});

	watchEffect(() => {
		const res = Object.entries(instance.vnode.props)
			.reduce((pre, [key, val]) => {
				if (exclude.includes(key)) return pre;
				if (/^on([A-Z])/.test(key)) {
					key = kebabCase(key.replace(/^on([^\s]+)/, "$1"));
					pre[key] = val;	
				}
				return pre;
			}, {});

		listeners.value = res;
	});

	return listeners;
};
