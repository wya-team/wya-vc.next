
import { createApp, h, onMounted, onUnmounted } from 'vue';
import type { DefineComponent } from 'vue';
import { cloneDeep } from 'lodash';
import { DOM } from '@wya/utils'; 
import { getUid, eleInRegExp } from '../utils/index';
import { VcBasic, VcError } from '../vc/index';
import { IS_SERVER } from '../utils/constant';
import defaultOptions from './default-options';
import type { PortalOptions, RenderOptions, ContainerElement } from './types';
import PortalLeaf from './portal-leaf';

// Options<DefineComponent> ->? Options<typeof defineComponent>
export default class Portal<T extends Options = Options<DefineComponent>> extends VcBasic {
    static View: DefineComponent;
	
	wrapper: T;

	waiting: boolean;

	globalOptions: Options;

	constructor(wrapper: T, options?: Options) {
		super();
		if (!wrapper) {
			throw new VcError('portal', '目标组件必传');
		}

		this.waiting = false;
		this.wrapper = wrapper;

		this.globalOptions = {
			...options,
			cName: options?.cName || wrapper.name || getUid('portal')
		};

		this.popup = this.popup.bind(this);
		this.destroy = this.destroy.bind(this);
	}

	// TODO: 考虑globalProperties等属性叠加 { ...x1, ...x2 }
	_getDefaultOptions() {
		return {
			...defaultOptions, 
			...this.config.Portal, 
			...this.globalOptions
		};
	}

	popup(userOptions: Options): Promise<unknown> | PortalLeaf | void {
		if (IS_SERVER) return;
		
		return this._init({ 
			...this._getDefaultOptions(),
			...userOptions 
		});
	}

	_init(options: PortalOptions): Promise<unknown> | PortalLeaf | void {
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

	_createCallback(getLeaf: () => PortalLeaf, options: PortalOptions, callback?: AnyFunction) {
		const { leaveDelay } = options;

		return (...res: any[]) => {
			setTimeout(() => {
				let leaf = getLeaf();
				if (!leaf) {
					// throw new VcError('portal', '实例不存在或已卸载');
					return;
				}

				leaf.destroy();
			}, leaveDelay * 1000);
			callback && callback(...res);
		};
	}

	_render({ options, response, onFulfilled, onRejected }: RenderOptions): PortalLeaf | void {
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
			multiple,
			fragment,

			// 全局注册
			globalProperties,
			install,
			components,
			uses,

			// 不推荐使用
			slots,
			parent,
			...rest
		} = options;

		let useAllNodes = fragment;
		cName = (multiple ? `${cName}__${getUid('portal')}` : cName);

		let container: ContainerElement = document.createElement(tag);
		let root: Nullable<HTMLElement> = typeof el === 'string' ? document.querySelector(el || 'body') : el;
		
		// destroy
		!alive && this.portals.get(cName)?.destroy();

		let propsData = rest;
		if (response || dataSource) {
			propsData.dataSource = response || dataSource;
		}

		// app
		let leaf = new PortalLeaf();
		const $onDestory = () => {
			if (!root) return;

			leaf.app?.unmount();
			if (useAllNodes) {
				root.contains(container) && root.removeChild(container);
			} else if (container && container._children) {
				container._children.forEach(i => {
					if (!root) return;
					root.contains(i) && root.removeChild(i);
				});
			}

			this.portals.delete(cName);

			// @ts-ignore 
			(root = null, leaf = null, container = null); // 默认GC会自动清理
		};
		const $onRejected = this._createCallback(() => leaf, options, onRejected);
		const $onFulfilled = this._createCallback(() => leaf, options, onFulfilled);

		if (alive && this.portals.has(cName)) {
			leaf = this.portals.get(cName) as PortalLeaf;

			for (let key in propsData) {
				(leaf.wrapper as any)[key] = propsData[key];
			}

			// update
			let fn = leaf.wrapper?.update || leaf.wrapper?.loadData;
			fn && fn(options);
		} else {
			let wrapper = this.wrapper;

			if (typeof this.wrapper == 'object') {
				wrapper = cloneDeep(this.wrapper);

				(wrapper as any).props = wrapper.props || {};

				wrapper.props.onPortalFulfilled = Function;
				wrapper.props.onPortalRejected = Function;
			}

			const app = createApp({
				name: 'vc-portal',
				parent,
				setup() {
					const handleExtra = (e: Event) => {
						// close默认不传，用户可传递参数判断输入自己的触发的close
						try {
							let path = (e as any).path || DOM.composedPath(e) || [];
							if (
								container 
								&& e.target
								&& !container.contains(e.target as HTMLElement) 
								&& !path.some((item: any) => eleInRegExp(item, aliveRegExp))
							) {
								if (
									leaf.wrapper 
									&& leaf.wrapper[aliveKey]
								) {
									leaf.wrapper[aliveKey] = false;
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
							ref: (vm: any) => (leaf.wrapper = vm),
							onPortalFulfilled: (...args: any[]) => $onFulfilled(...args),
							onPortalRejected: (...args: any[]) => $onRejected(...args)
						}, 

						slots || undefined
					);
				}
			});

			leaf.app = app;

			if (globalProperties) {
				app.config.globalProperties = globalProperties;
			}

			// store, router等
			for (let key in components) {
				app.component(key, components[key]);
			}

			for (let key in uses) {
				app.use(uses[key]);
			}

			install && install(app);
			
			app.mount(container);
		}

		// destroy method
		leaf.destroy = $onDestory;

		// tag
		leaf.autoDestroy = autoDestroy;

		// 回调leaf实例
		getInstance && getInstance(leaf);

		// 标记
		this.portals.set(cName, leaf);

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
			container.parentElement === null && root?.appendChild(container);
		} else {
			!container._children && (
				container._children = [],
				Array
					.from(container.children)
					.forEach(i => {
						root?.appendChild(i as HTMLElement);
						container._children?.push?.(i as HTMLElement);
					})
			);
		}

		this.waiting = false;
		return leaf;
	}

	/**
	 * 销毁当前Portal下的节点
	 * @param {string | PortalLeaf} target [description]
	 */
	destroy(target?: string | PortalLeaf) {
		const { multiple, cName } = this._getDefaultOptions();
		target = target || (cName);
		const instance: PortalLeaf = typeof target === 'object' 
			? target 
			: (this.portals.get(target) as PortalLeaf);

		if (instance) {
			instance.destroy();
		} else if (multiple) {
			this.portals.forEach((item, key) => {
				if (key.includes(cName)) {
					item.destroy();
				}
			});
		}
	}
}