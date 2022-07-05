import { Storage } from '@wya/utils';
import { ajax } from '@wya/http';
import VcBasic from '../vc/basic';
import VcError from '../vc/error';
import { IS_SERVER } from '../utils/constant';
import type { IconHash, IconEvent, IconUrlStatus } from './types';

const svgReg = /.*<svg>(.*)<\/svg>.*/g;
const basicReg = /.*id="icon-([^"]+).*viewBox="([^"]+)(.*)/g;
const symbolReg = /<symbol.*?<\/symbol>/gi;
const pathReg = /<path.*?<\/path>/gi;
const dReg = /.*d="([^"]+).*/g;
const fillReg = /.*fill="([^"]+).*/g;
const basicUrl = '//at.alicdn.com/t/font_1119857_u0f4525o6sd.js';
const prefix = '@wya/vc-icon:';
const IS_DEV = process.env.NODE_ENV === 'development';

class IconManager extends VcBasic {
	icons: IconHash;

	events: IconEvent;

	sourceStatus: Options;

	basicStatus?: IconUrlStatus;

	constructor() {
		super();
		this.icons = {} as IconHash;
		this.events = {} as IconEvent;
		this.sourceStatus = {} as Indexable<IconUrlStatus>;

		/**
		 * 初始化加载, Storage.version设置问题需要使用异步
		 */
		setTimeout(() => {
			this.basicStatus = this.load(basicUrl);
		}, 0);
	}

	load(url: string): IconUrlStatus {
		this.sourceStatus[url] = this.sourceStatus[url] || new Promise<void>((resolve, reject) => {
			(async () => {
				try {
					if (!IS_SERVER && /.js$/.test(url)) { // 避免重复加载
						let key = `${prefix}${url}`;
						let icons = Storage.get(key);
						
						if (!icons) {
							let res = await ajax({
								url: `${window.location.protocol.replace(/[^:]+/, 'https')}${url}`,
								headers: {
									'X-Requested-With': null
								},
								credentials: 'omit',
								onAfter: ({ response }) => {
									return {
										status: 1,
										data: response.data
									};
								}
							});
							// 等待解析
							icons = await this.parser(res.data, url);
						
							let response = Storage.set(key, icons);

							// 内存溢出，删除老缓存, 延迟3秒清理，重新设置
							if (response) {
								setTimeout(() => {
									this.clearResource();
									// 如果还存在溢出，项目内自行处理吧
									Storage.set(key, icons);
								}, 3000);
							}
						}
						// 重构图标
						this.icons = {
							...this.icons,
							...icons,
						};
						// 执行
						Object.keys(this.events).forEach((type) => {
							let fns = this.events[type];
							if (this.icons[type] && fns) {
								fns.forEach((fn: AnyFunction) => fn());
								this.events[type] = null;
							}
						});

						// 结束
						resolve();
					}
				} catch (e) {
					reject();
					throw new VcError('icon', e);
				}
			})();
		});

		return this.sourceStatus[url];
	}

	/**
	 * TODO: 启用webwork处理 or fiber处理
	 */
	parser(svgStr: string, url: string) {
		return new Promise((resolve, reject) => {
			let icons = {};
			setTimeout(() => {
				try {
					IS_DEV && console.time(url);
					svgStr.replace(svgReg, '$1')?.match(symbolReg)?.forEach( 
						(i: string) => i.replace(basicReg, (_: string, ...args: any[]): string => {
							const [$1, $2, $3] = args;
							icons[`${$1}`] = {
								viewBox: $2,
								path: $3?.match(pathReg)?.map((j: string) => ({
									d: j.replace(dReg, '$1'),
									fill: fillReg.test($3) ? j.replace(fillReg, '$1') : ''
								}))
							};
							return '';
						})
					);
					IS_DEV && console.timeEnd(url);
					resolve(icons);
				} catch (e) {
					reject();
					throw new VcError('icon', e);
				}
			}, 0);
		});
	}

	on(type: string, fn: AnyFunction) {
		if (typeof type !== 'string') return this;

		this.events[type] = this.events[type] || [];

		if (this.events[type].length > 100) {
			this.events[type] = null;

			if (!IS_SERVER) {
				throw new VcError('icon', `${type}不存在该图标，不要重复注册`);
			}
		}

		this.events[type].push(fn); 

		return this;
	}

	/**
	 * 必传
	 */
	off(type: string, fn: AnyFunction) {
		if (typeof type !== 'string' || typeof fn !== 'function') return this;

		this.events[type] = this.events[type].filter((i: AnyFunction) => i != fn);

		return this;
	}
	
	private clearResource() {
		let needs = Object.keys(this.sourceStatus); 
		Object.keys(window.localStorage).forEach((item) => {
			if (item.includes(prefix)) {
				const key = item.split(prefix).pop();
				key && !needs.includes(key) 
					&& window.localStorage.removeItem(item); // 这里需要使用localStorage
			}
		});
	}
}

export default new IconManager();
