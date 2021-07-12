import {
	getCurrentInstance,
	reactive,
	shallowRef,
	watchEffect
} from 'vue';
import { kebabCase, camelCase } from 'lodash';

/**
 * standard: v3的标准(inheritAttrs: false)
 * 	-> class, style, attrs和listeners合并在attrs中
 * 当standard设置为false, attrs, listeners, class, style独立存在
 *
 * Tips: inheritAttrs: true时, attrs中不含class, style, listeners
 */
interface Options {
	standard?: boolean
	exclude?: string[]
}

/**
 * 让attrs变为响应式，而非使用onUpdated进行绑定
 * inheritAttrs：false, style, class不是响应式，需要用到此方法
 */
export const useAttrs = (options: Options = {}) => {
	const { standard = true, exclude = [] } = options;
	const instance = getCurrentInstance();
	const attrs = shallowRef({});

	instance.attrs = reactive(instance.attrs);

	watchEffect(() => {
		const res = Object.entries(instance.attrs)
			.reduce((pre, [key, val]) => {
				if (exclude.includes(key)) return pre;
				if (!standard) {
					if (/^on([A-Z])/.test(key)) {
						key = kebabCase(key.replace(/^on([^\s]+)/, "$1"));
						pre.listeners[key] = val;	
					} else if (/(class|style)/.test(key)) {
						pre[key] = val;
					} else {
						pre.attrs[key] = val;
					}
					return pre;
				} 
				// key为小驼峰
				pre.attrs[camelCase(key)] = val;
				return pre;
			}, {
				style: {},
				class: {},
				attrs: {},
				listeners: {}
			});

		attrs.value = standard ? res.attrs : res;
	});

	// 注意这是一个ref
	return attrs;
};
