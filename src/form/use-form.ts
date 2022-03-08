import { provide, getCurrentInstance } from 'vue';
import type { VNode } from 'vue';
import { sortBy } from 'lodash';
import { VcError } from '../vc/index';
import type { 
	FormInject, 
	FormInstance, 
	FormItemInstance, 
	FormOptions, 
	FormValidateOptions, 
	FormValidateResponse 
} from './types';

export default (options: FormOptions = {}) => {
	const instance = getCurrentInstance() as FormInstance;
	const { slots, props } = instance;

	const fields: FormItemInstance[] = [];

	provide('form', {
		props,
		add: (item: FormItemInstance) => {
			item && fields.push(item);
		},
		remove: (item: FormItemInstance) => {
			item.props.prop && fields.splice(fields.indexOf(item), 1);
		}
	} as FormInject);

	const resetFields = () => {
		fields.forEach(item => item.proxy.resetField());
	};

	const getField = (prop: string) => {
		const field = fields.find(item => item.props.prop === prop);
		if (!field) throw new VcError('form', '请选择有用的prop值');

		return field;
	};

	const showToast = (msg: string) => {
		props.showMessage 
			&& options.throwToast 
			&& options.throwToast(msg);
	};

	/**
	 * 同时处理嵌套form-item
	 * TODO: 渲染时计算（使用[form]vnode.el和[formItem]vnode.el）
	 */
	const sortErrors = (errors: any[]) => {
		let basicSort = {};
		let count = 0;

		let fn = (vnodes: VNode[]) => {
			vnodes.forEach((vnode: VNode) => {
				try {
					let { prop } = vnode.props || {}; 
					let { children } = vnode;

					if (
						prop
						&& typeof vnode.type === 'object' 
						&& (vnode.type as any).name 
						&& /^vcm?-form-item$/.test((vnode.type as any).name)
					) {
						basicSort[prop] = count++;
					} else if (children && typeof (children as any).default === 'function') {
						// 如果children中含 vc-table 且使用了#default="{ row }"，目前暂时先屏蔽报错
						try {
							fn((children as any).default({ row: {}, $index: -1 }));
						} catch {
							// any	
						}
					} else if (children && children instanceof Array) {
						fn(children as VNode[]);
					}
				} catch (e) {
					throw new VcError('form', e);
				}
			});
		};

		fn((slots?.default as any)?.());
		errors = sortBy(errors, [(i) => basicSort[i.prop]]);
		return errors;
	};

	const scrollIntoView = (prop: string) => {
		let field = getField(prop);
		(field.vnode as VNode)?.el?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	};

	const validate = (opts: FormValidateOptions = {}) => {
		const { scroll = true } = opts;

		return new Promise<void | object[]>((resolve, reject) => {
			let count = 0;
			let originErrors: object[] = [];

			if (!fields.length) {
				resolve();
				return;
			}

			fields.forEach(item => {
				item.proxy.validate('', (res: FormValidateResponse = {}) => {
					if (res.msg || res.message) {
						originErrors.push(res);
					}
					if (++count === fields.length) {
						let errors = sortErrors(originErrors);

						// 全部校验完成
						if (errors.length !== 0) {
							reject(errors);
							showToast(errors[0].msg || errors[0].message);

							scroll && scrollIntoView(errors[0].prop);
						}

						resolve();
					}
				});
			});
		});
	};

	const validateField = (prop, opts: FormValidateOptions = {}) => {
		const { scroll = true } = opts;

		return new Promise<void | object[]>((resolve, reject) => {
			let field = getField(prop);
			field.proxy.validate('', (res = {}) => {
				let errorMsg = res.msg || res.message;
				if (errorMsg) {
					reject(errorMsg);
					showToast(errorMsg);
					scroll && scrollIntoView(prop);
				}
				resolve();
			});
		});
	};
	
	return {
		getField,
		resetFields,
		validate,
		validateField
	};
};