import { createApp, h, onMounted, onUnmounted, getCurrentInstance, Teleport } from 'vue';
import { cloneDeep } from 'lodash';
import { DOM } from '@wya/utils';
import { getUid, eleInRegExp } from '../utils/index';
import { VcBasic, VcError } from '../vc/index';
import { 
	IS_SERVER, 
	PORTAL_AUTO_DESTROY_TAG, 
	PORTAL_DESTROY_METHOD, 
	PORTAL_WRAPPER_INSTANCE
} from '../utils/constant';
import defaultOptions from './default-options';

export default class Portal extends VcBasic {
	constructor(wrapper, registerOptions = {}) {
		super();
		let { cName, ...globalOptions } = registerOptions;

		if (!wrapper) {
			throw new VcError('portal', '目标组件必传');
		}

		cName = cName || wrapper.name || getUid('portal');

		this.waiting = false;
		this.wrapper = wrapper;

		// 与全局配置, 重新生成默认配置
		globalOptions.cName = cName;
		this.globalOptions = globalOptions;

		this.popup = this.popup.bind(this);
		this.destroy = this.destroy.bind(this);
	}

	_getDefaultOptions() {
		return {
			...defaultOptions, 
			...this.config.Portal, 
			...this.globalOptions
		};
	}

	popup(userOptions = {}) {
		if (IS_SERVER) return;
		if (typeof userOptions !== 'object') {
			userOptions = {};
		}
		return this._init({ 
			...this._getDefaultOptions(),
			...userOptions 
		});
	}

	_init(options) {
		const { onBefore, onFulfilled, onRejected, promise, ...rest } = options;

		return promise 
			? new Promise((resolve, reject) => {
				(async () => {
					if (onBefore && !this.waiting) {
						try {
							this.waiting = true;
							let response = await onBefore(options);
							this._render({ 
								options: rest, 
								response,
								onFulfilled: resolve,
								onRejected: reject,
							});
						} catch (res) {
							this.waiting = false;
							reject(res);
						}
						
					} else {
						this._render({ 
							options: rest, 
							onFulfilled: resolve,
							onRejected: reject,
						});
					}
				})();
			})
			: this._render({ 
				options: rest, 
				onFulfilled, 
				onRejected 
			});
	}

	_createCallback(getApp, options, callback) {
		const { leaveDelay } = options;

		return (...res) => {
			setTimeout(() => {
				let app = getApp();
				if (!app) {
					// throw new VcError('portal', '实例不存在或已卸载');
					return;
				}
				app[PORTAL_DESTROY_METHOD]();
			}, leaveDelay * 1000);
			callback && callback(...res);
		};
	}

	_render({ options, response, onFulfilled, onRejected }) {
		let { 
			el, 
			tag, 
			alive, // 再次调用，实例不销毁
			aliveRegExp, // 实例以外且该数组内的, 点击不销毁
			aliveKey,
			cName,
			leaveDelay,
			autoDestroy,
			getInstance, 
			dataSource,
			components,
			uses,
			multiple,
			fragment,

			// 不推荐使用
			slots,
			parent,
			...rest
		} = options;

		let useAllNodes = fragment;
		cName = multiple ? `${cName}__${getUid()}` : cName;

		let container = document.createElement(tag);
		let root = typeof el === 'string' ? document.querySelector(el || 'body') : el;
		
		// destroy
		!alive && this.APIS[cName] && this.APIS[cName][PORTAL_DESTROY_METHOD]();

		let propsData = rest;
		if (response || dataSource) {
			propsData.dataSource = response || dataSource;
		}

		// app
		let app;
		const $onDestory = () => {
			app && app.unmount();

			if (useAllNodes) {
				root.contains(container) && root.removeChild(container);
			} else if (container && container._children) {
				container._children.forEach(i => {
					root.contains(i) && root.removeChild(i);
				});
			}

			this.APIS[cName] = null;
			delete this.APIS[cName];

			app = null;
			container = null;
			root = null;
		};
		const $onRejected = this._createCallback(() => app, options, onRejected);
		const $onFulfilled = this._createCallback(() => app, options, onFulfilled);

		if (alive && this.APIS[cName]) {
			app = this.APIS[cName];

			for (let key in propsData) {
				app[key] = propsData[key];
			}

			// update
			let fn = app.update || app.loadData;
			fn && fn(options);
			
		} else {
			let wrapper = this.wrapper;

			if (typeof this.wrapper == 'object') {
				wrapper = cloneDeep(this.wrapper);
				wrapper.props = wrapper.props || {};
				wrapper.props.onPortalFulfilled = Function;
				wrapper.props.onPortalRejected = Function;
			}

			app = createApp({
				name: 'vc-portal',
				parent,
				setup() {
					const handleExtra = (e) => {
						// close默认不传，用户可传递参数判断输入自己的触发的close
						try {
							let path = e.path || DOM.composedPath(e) || [];
							if (
								!container.contains(e.target) 
								&& !path.some(item => eleInRegExp(item, aliveRegExp))
							) {
								if (
									app[PORTAL_WRAPPER_INSTANCE] 
									&& app[PORTAL_WRAPPER_INSTANCE][aliveKey]
								) {
									app[PORTAL_WRAPPER_INSTANCE][aliveKey] = false;
									setTimeout(() => $onRejected(), leaveDelay * 1000);
								} else {
									$onRejected();
								}
							}
						} catch (error) {
							throw new VcError('portal', error);
						}
					};

					onMounted(() => {
						alive && document.addEventListener('click', handleExtra, true);
					});

					onUnmounted(() => {
						alive && document.addEventListener('click', handleExtra, true);
					});

					return () => h(
						wrapper, 
						{
							...propsData,
							ref: vm => (app[PORTAL_WRAPPER_INSTANCE] = vm),
							onPortalFulfilled: (...args) => $onFulfilled(...args),
							onPortalRejected: (...args) => $onRejected(...args)
						}, 

						slots || null
					);
				}
			});


			app.mount(container);

			Object.keys(components).forEach((key) => {
				 app.component(key, components[key]);
			});

			// store, router等, TODO: 定义规范
			Object.keys(uses).forEach((use) => {
				 app.use(use);
			});
		}

		// destroy method
		app[PORTAL_DESTROY_METHOD] = $onDestory;

		// tag
		app[PORTAL_AUTO_DESTROY_TAG] = autoDestroy;

		// 回调app实例
		getInstance && getInstance(app);

		// 标记
		this.APIS[cName] = app;


		/**
		 * if 
		 * 渲染结果为: <div data-v-app> <wrapper /> </div>
		 * 两种情况
		 * 1. wrapper根节点使用v-if
		 * 2. fragment: true, 解决渲染问题
		 * 
		 * （因为wrapper没有根节点, childs中的更节点使用v-if，后续不会渲染出来）
		 *
		 * else
		 * 渲染结果为: <wrapper /> 
		 */
		if (
			fragment 
			|| (
				typeof container._children === 'undefined'
				&& !Array.from(container.children).length
			) 
		) {
			useAllNodes = true;
			container.parentElement === null && root.appendChild(container);
		} else {
			!container._children && (
				container._children = [],
				Array
					.from(container.children)
					.forEach(i => {
						root.appendChild(i);
						container._children.push(i);
					})
			);
		}

		this.waiting = false;
		return app;
	}

	destroy(target) {
		const { multiple, cName } = this._getDefaultOptions();
		target = target || cName;
		const instance = typeof target === 'object' 
			? target 
			: this.APIS[target];

		if (instance) {
			instance[PORTAL_DESTROY_METHOD]();
		} else if (multiple) {
			Object.keys(this.APIS).forEach(item => {
				if (item.includes(cName)) {
					this.APIS[item] && this.APIS[item][PORTAL_DESTROY_METHOD]();
				}
			});
		}
	}
}