import VcError from './error';
import { PORTAL_AUTO_DESTROY_TAG, PORTAL_DESTROY_METHOD } from '../utils/constant';


class VcBasic {
	setConfig(options = {}) {
		/**
		 * 共享配置
		 */
		VcBasic.prototype.config = {
			...VcBasic.prototype.config,
			...options
		};
	}
	
	/**
	 * 清理Portals类型组件
	 * @param  {str | array} cName 清理的组件名
	 * @param  {str | array} force 是否强制清理, cName 存在会变为true
	 */
	clear(cName, force = false) {
		try {
			// 清理对象 
			let target = [];
			if (cName) {
				if (typeof cName === 'string') {
					target = [cName];
				} else if (cName instanceof Array && cName.length > 0) {
					target = cName;
				}
				target = target.reduce((pre, cur) => { pre[cur] = ''; return pre; }, {});

				// 清理
				force = true;
			} else {
				target = this.APIS;
			}
			for (let i in target) {
				if (this.APIS[i] && (force === true || this.APIS[i][PORTAL_AUTO_DESTROY_TAG] === true)) {
					this.APIS[i][PORTAL_DESTROY_METHOD]();
					delete this.APIS[i];
				}
			}
		} catch (e) {
			throw new VcError('instance', e);
		}
		return this;
	}

	/**
	 * 清理全部
	 */
	clearAll() {
		try {
			for (let i in this.APIS) {
				if (this.APIS[i]) {
					this.APIS[i][PORTAL_DESTROY_METHOD]();
					delete this.APIS[i];
				}
			}
		} catch (e) {
			throw new VcError('instance', e);
		}
		return this;
	}
}


/**
 * 处理全局捕获的事件, 用于计算位置
 */
VcBasic.prototype.globalEvent = {};
typeof window !== 'undefined' && document.addEventListener('click', (e) => {
	VcBasic.prototype.globalEvent = e;
}, true);

/**
 * 仅用户共享属性
 */
VcBasic.prototype.APIS = {};

VcBasic.prototype.config = {
	version: '3.0.0',
	debug: process.env.NODE_ENV === 'development'
};

export default VcBasic;