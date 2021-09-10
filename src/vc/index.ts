import type { App } from 'vue';
import VcManager from './manager';
import type { Config } from './types';

export { default as VcBasic } from './basic';
export { default as VcError } from './error';

/**
 * 组件内部调用
 */
export const VcInstance = new VcManager();

/**
 * 注册使用
 */
export default {
	install(app: App, options?: Config) {
		app.config.globalProperties.$vc = VcInstance.init(options);
	},
	instance: VcInstance
};