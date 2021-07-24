import normalizeWheel from 'normalize-wheel';
import { raf } from './utils';

export default class WheelHandler {
	constructor({ onWheel, shouldWheelX, shouldWheelY, stopPropagation }) {
		this._animationFrameID = null;
		this._deltaX = 0;
		this._deltaY = 0;
		this._didWheel = this._didWheel.bind(this);
		if (typeof shouldWheelX !== 'function') {
			shouldWheelX = () => !!shouldWheelX;
		}

		if (typeof shouldWheelY !== 'function') {
			shouldWheelY = () => !!shouldWheelY;
		}

		if (typeof stopPropagation !== 'function') {
			stopPropagation = () => !!stopPropagation;
		}

		this._shouldWheelX = shouldWheelX;
		this._shouldWheelY = shouldWheelY;
		this._stopPropagation = stopPropagation;
		this._onWheelCallback = onWheel;

		// handler
		this.handler = this.handleWheel.bind(this);
	}

	handleWheel(e) {
		let normalizedEvent = normalizeWheel(e);
		let deltaX = this._deltaX + normalizedEvent.pixelX;
		let deltaY = this._deltaY + normalizedEvent.pixelY;
		let shouldWheelX = this._shouldWheelX(deltaX, deltaY);
		let shouldWheelY = this._shouldWheelY(deltaY, deltaX);
		if (!shouldWheelX && !shouldWheelY) {
			return;
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

	_didWheel() {
		this._animationFrameID = null;
		this._onWheelCallback(this._deltaX, this._deltaY);
		this._deltaX = 0;
		this._deltaY = 0;
	}
}
