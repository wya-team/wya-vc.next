import { Device } from '@wya/utils';
import normalizeWheel from 'normalize-wheel';
import { raf } from './utils';
import { WHEEL_EVENT_NAME } from './utils/constant';

/**
 * 原生的scroll, 滑动到底部不会继续，需要放开再次滑动才能触发父层滑动
 */
const wait = 30;
const timers = new Set();

if (typeof document !== 'undefined') {
	let handler = () => {
		timers.forEach(context => {
			context.timer && clearTimeout(context.timer);
			context.timer = setTimeout(() => {
				context.clear();
				timers.delete(context);
			}, wait);
		});
	};
	document.body.addEventListener('wheel', handler, true);
	document.body.addEventListener('mousedown', handler, true);
}

export default class WheelHandler {
	constructor({ 
		onWheel, 
		shouldWheelX, 
		shouldWheelY, 
		stopPropagation,
		behavior
	}) {
		if (typeof shouldWheelX !== 'function') {
			shouldWheelX = () => !!shouldWheelX;
		}

		if (typeof shouldWheelY !== 'function') {
			shouldWheelY = () => !!shouldWheelY;
		}

		if (typeof stopPropagation !== 'function') {
			stopPropagation = () => !!stopPropagation;
		}

		this._scrollBehavior = behavior === 'scroll';
		this._needThresholdWait = false;
		this._animationFrameID = null;
		this._deltaX = 0;
		this._deltaY = 0;
		this._shouldWheelX = shouldWheelX;
		this._shouldWheelY = shouldWheelY;
		this._stopPropagation = stopPropagation;
		this._onWheel = onWheel;
		this._didWheel = this._didWheel.bind(this);
	
		this.timer = null;
		this.handler = this.handler.bind(this);
		this.clear = this.clear.bind(this);
	}

	_didWheel() {
		this._animationFrameID = null;
		this._onWheel(this._deltaX, this._deltaY);
		this._deltaX = 0;
		this._deltaY = 0;
	}

	clear() {
		this._needThresholdWait = false;
	}

	handler(e) {
		let normalizedEvent = normalizeWheel(e);
		let deltaX = this._deltaX + normalizedEvent.pixelX;
		let deltaY = this._deltaY + normalizedEvent.pixelY;
		let shouldWheelX = this._shouldWheelX(deltaX, deltaY);
		let shouldWheelY = this._shouldWheelY(deltaY, deltaX);
		if (!shouldWheelX && !shouldWheelY) {
			if (this._scrollBehavior && this._needThresholdWait) {
				e.preventDefault();
				this.timer && clearTimeout(this.timer);
				this.timer = setTimeout(this.clear, wait);
				timers.add(this);
			}
			return;
		}

		if (this._scrollBehavior) {
			this.timer && clearTimeout(this.timer);
			this._needThresholdWait = true;
		}

		this._deltaX += shouldWheelX ? normalizedEvent.pixelX : 0;
		this._deltaY += shouldWheelY ? normalizedEvent.pixelY : 0;
		// 阻止X，Y轴上的滚动时，父层滚动（mac下的父层滚动越界会带有回弹）
		e.preventDefault();

		let changed;
		if (this._deltaX !== 0 || this._deltaY !== 0) {
			if (this._stopPropagation()) {
				e.stopPropagation();
			}
			changed = true;
		}

		if (changed === true && this._animationFrameID === null) {
			this._animationFrameID = raf(this._didWheel);
		}
	}
}
