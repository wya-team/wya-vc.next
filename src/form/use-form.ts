import { provide, ref, watchEffect, reactive, getCurrentInstance } from 'vue';
import { sortBy } from 'lodash';
import { VcError } from '../vc/index';

export default (options = {}) => {
	const instance = getCurrentInstance();
	const { slots, props } = instance;

	const fields = [];

	provide('form', {
		props,
		add: item => {
			item && fields.push(item);
		},
		remove: item => {
			item.props.prop && fields.splice(fields.indexOf(item), 1);
		}
	});

	const resetFields = () => {
		fields.forEach(item => item.proxy.resetField());
	};

	const getField = (prop) => {
		const field = fields.find(item => item.props.prop === prop);
		if (!field) throw new VcError('form', '请选择有用的prop值');

		return field;
	};

	const showToast = (msg) => {
		props.showMessage 
			&& options.throwToast 
			&& options.throwToast(msg);
	};

	/**
	 * 同时处理嵌套form-item
	 * TODO: 渲染时计算（使用[form]vnode.el和[formItem]vnode.el）
	 */
	const sortErrors = (errors) => {
		let basicSort = {};
		let count = 0;

		let fn = (vnodes) => {
			vnodes.forEach((vnode, index) => {
				try {
					let { prop } = vnode.props || {}; 
					let { children } = vnode;

					if (
						prop
						&& typeof vnode.type === 'object' 
						&& vnode.type.name 
						&& /^vcm?-form-item$/.test(vnode.type.name)
					) {
						basicSort[prop] = count++;
					} else if (children && children.default) {
						fn(children.default());
					} else if (children && children instanceof Array) {
						fn(children);
					}
				} catch (e) {
					throw new VcError('form', e);
				}
			});
		};

		fn(slots.default?.());
		errors = sortBy(errors, [(i) => basicSort[i.prop]]);
		return errors;
	};

	const scrollIntoView = (prop, opts = {}) => {
		let field = getField(prop);
		field.vnode.el.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	};

	const validate = (opts = {}) => {
		const { scroll = true } = opts;

		return new Promise((resolve, reject) => {
			let valid = true;
			let count = 0;
			let originErrors = [];

			if (!fields.length) {
				resolve();
				return;
			}

			fields.forEach(item => {
				item.proxy.validate('', (res = {}) => {
					if (res.msg || res.message) {
						originErrors.push(res);
						valid = false;
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

	return {
		getField,
		resetFields,
		validate
	};
};