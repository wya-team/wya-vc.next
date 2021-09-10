import VcError from './error';
import type { Config } from './types';
import type PortalLeaf from '../portal/portal-leaf';

const portals = new Map<string, PortalLeaf>();
let globalEvent: MouseEvent;
let config: Config;

typeof window !== 'undefined' && document.addEventListener('click', (e: MouseEvent) => {
	globalEvent = e;
}, true);

class VcBasic {
	/**
	 * 组件的配置项
	 */
	config: Config;

	/**
 	  * 处理全局捕获的事件, 用于计算位置
 	  */
	globalEvent: MouseEvent;

	/**
	 * 自定义弹窗
	 */
	portals: Map<string, PortalLeaf>;

	constructor() {
		this.globalEvent = globalEvent || {};
		this.portals = portals;
		this.config = config || {};
	}

	/**
	 * 设置组件配置项, 共享配置
	 * @param  {Config} options 清理的组件名
	 */
	setConfig(options: Config) {
		config = { ...config, ...options };
	}
	
	/**
	 * 清理Portals类型组件
	 * @param  {string | string[]} cName 清理的组件名
	 * @param  {boolean} force 是否强制清理, cName 存在会变为true
	 */
	clear(cName: string | string[], force: boolean = false) {
		try {
			// 清理对象 
			let target = new Map<string, any>();
			if (cName) {
				let cNames: string[] = [];
				if (typeof cName === 'string') {
					cNames = [cName];
				} else if (cName instanceof Array && cName.length > 0) {
					cNames = cName;
				}

				cNames.forEach(i => target.set(i, '')); 

				// 清理
				force = true;
			} else {
				target = this.portals;
			}
			for (let key of target.keys()) {
				const portal = this.portals.get(key);
				if (portal && (force === true || portal.autoDestroy === true)) {
					portal.destroy();
				}
			}
		} catch (e) {
			throw new VcError('instance', e);
		}
		return this;
	}

	/**
	 * 清理全部Portals
	 */
	clearAll() {
		try {
			this.portals.forEach((item) => item[1].destroy());
		} catch (e) {
			throw new VcError('instance', e);
		}
		return this;
	}
}

export default VcBasic;