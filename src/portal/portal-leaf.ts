import type { App } from 'vue';
import type { Wrapper } from './types';
import { VcError } from '../vc/index';

class PortalLeaf {
	app?: App;

	/**
	 * 目标的实例，挂载到app上，wrapper官方没使用，暂时用这个
	 */
	wrapper?: Wrapper;

	/**
	 * 销毁的函数，挂载到app上，避免冲突
	 * @type {[type]}
	 */
	destroy: AnyFunction;

	/**
	 * 自动销毁的标记，挂载到app上，避免冲突
	 */
	autoDestroy: boolean;

	constructor() {
		this.autoDestroy = false;
		this.destroy = () => {
			throw new VcError('portal', '未注册的destroy方法');
		};

	}
}

export default PortalLeaf;