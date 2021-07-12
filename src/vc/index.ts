import VcManager from './manager';

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
	install(app, opts = {}) {
		app.config.globalProperties.$vc = VcInstance.init(opts);
	},
	instance: VcInstance
};


