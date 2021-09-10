import Vue from 'vue';
import Modal from './modal';
import { getOption } from '../../utils/index';
import Portal from '../../portal/index';

const registerOptions = {
	multiple: true,
	promise: false 
};

class ModalManager extends Portal {
	allowMethod = ['alert', 'operation']
	constructor(wrapper, globalOptions) { // eslint-disable-line
		super(wrapper, globalOptions);

		this.allowMethod.forEach(mode => {
			this[mode] = (opts = {}) => {
				let portal = this.run({ 
					...opts, 
					confirm: true,
					mode,
					onFulfilled: opts.onClose,

					// 当组件内使用emit('close')，避免重复触发
					onClose: null
				});
				// 与2.x不同
				portal.wrapper.isActive = true;
				return portal;
			};
		});
	}

	run(options) {
		return this.popup(options);
	}
}
export default new ModalManager(Modal, registerOptions);