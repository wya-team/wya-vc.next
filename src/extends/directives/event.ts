/**
 * hack vue events 
 * 针对兼容处理
 * 1. 浏览器不同事件
 * 2. 微信iOS 10， portal 无法绑定事件做处理
 */
import { Device, Utils } from '@wya/utils';
/**
 * Mouse wheel normalization across multiple multiple browsers
 * https://github.com/basilfx/normalize-wheel
 * 由facebook针对滚轮事件在不同浏览器在兼容性、滚动距离和滚动速度做的优化代码
 *
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Element/wheel_event
 * 当滚动鼠标滚轮或操作其它类似输入设备时会触发滚轮事件。滚轮事件替换了已被弃用的非标准mousewheel事件。
 */
import normalizeWheel from 'normalize-wheel';
import { getUid } from '../../utils';

const eventKey = 'v-event';
const noop = () => {};

let events = {};
const getEventName = (eventType) => {
	switch (eventType) {
		case 'wheel':
		case 'mousewheel':
			return Device.firefox 
				? 'DOMMouseScroll' 
				: 'wheel'; // v3.x mousewheel -> wheel
		default:
			return eventType;
			
	}
};
const getHandler = (eventType) => {
	return function (e) {
		const id = this[eventKey];
		const { method, modifiers } = events[id][eventType];
		
		modifiers.stop && e.stopPropagation();
		modifiers.prevent && e.preventDefault();

		switch (eventType) {
			case 'wheel':
			case 'mousewheel':
				method(e, normalizeWheel(e));
				break;
			default:
				method(e);
				break;
		}
	};
};
export default {
	beforeMount(el, binding) {
		const { modifiers, arg, value } = binding;

		let method = value || noop;
		let eventType = arg;

		let eventName = getEventName(eventType);
		let handler = getHandler(eventType);
		let id = el[eventKey] || getUid('events');
		events[id] = events[id] || [];

		events[id][eventType] = {
			eventType,
			eventName,
			handler,
			method,
			modifiers
		};
		/**
		 * el bind
		 * TODO
		 */
		el[eventKey] = id;
		el.addEventListener(eventName, handler);
	},

	updated(el, binding) {
		const { modifiers, arg, value } = binding;

		let method = value || noop;
		let eventType = arg;
		let id = el[eventKey];
			
		if (events[id][eventType].method !== method) {
			events[id][eventType].method = method;
		}
	},

	/**
	 * 卸载对应的事件
	 */
	unmounted(el, binding) {
		const { modifiers, arg, value } = binding;

		let id = el[eventKey];
		let eventType = arg;
		let { handler, eventName } = events[id][eventType];

		el.removeEventListener(eventName, handler);

		delete events[id][eventType];

		if (Object.keys(events[id]).length === 0) {
			delete events[id];
		}
	}
};
