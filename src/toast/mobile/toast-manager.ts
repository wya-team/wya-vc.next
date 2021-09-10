import { getOption } from '../../utils/index';
import Portal from '../../portal/index';
import MToast from './toast.vue';
import type { ToastOptions } from '../types';

const registerOptions = {
	multiple: true,
	promise: false, 
	autoDestroy: false
};

class MToastManager extends Portal {
	constructor(wrapper: any, globalOptions: Options) { // eslint-disable-line
		super(wrapper, globalOptions);
		// todo
	}

	run(params: any[], toastOptions: ToastOptions) {
		let query = ['content', 'duration', 'onClose', 'maskClosable'];
		let options = {
			...toastOptions,
			...getOption(params, query)
		};

		// 执行弹窗
		return this.popup({
			...options,
			onFulfilled: options.onClose,
			onClose: null
		});
	}

	info(...params: any[]) {
		return this.run(params, {
			mode: 'info'
		});
	}

	loading(...params: any[]) {
		return this.run(params, {
			mode: 'loading',
			duration: 0,
			maskClosable: false
		});
	}

	success(...params: any[]) {
		return this.run(params, {
			mode: 'success'
		});
	}

	warning(...params: any[]) {
		return this.run(params, {
			mode: 'warning'
		});
	}

	error(...params: any[]) {
		return this.run(params, {
			mode: 'error'
		});
	}
}
export default new MToastManager(MToast, registerOptions);
