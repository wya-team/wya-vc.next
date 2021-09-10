import IconManager from '../icon/manager';
import VcBasic from './basic';
import VcError from './error';

class VcManager extends VcBasic {
	hasInit: boolean;
	
	constructor() {
		super();
		this.hasInit = false;
	}

	/**
	 * 初始化配置全局
	 */
	async init(options = {}) {
		if (!this.hasInit) {
			super.setConfig(options);
			this.hasInit = true;
			try {
				let { urls = [] } = this.config.Icon || {};
				await Promise.all(urls.map((url: string) => IconManager.load(url)));
			} catch (e) {
				throw new VcError('instance', e);
			}
		} else {
			throw new VcError('instance', '只能初始化一次');
		}
		return this;
	}
}

export default VcManager;