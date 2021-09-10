import normalizeWheel from 'normalize-wheel';
import { raf } from './utils';
import type { Raf, WheelOptions } from './types';

/**
 * 原生的scroll, 滑动到底部不会继续，需要放开再次滑动才能触发父层滑动
 */
const wait = 30;
const timers = new Set();

if (typeof document !== 'undefined') {
	let handler = () => {
		timers.forEach((context: any) => {
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
	private scrollBehavior: boolean;

	private needThresholdWait: boolean;

	private animationFrameID: Nullable<number>;

	private deltaX: number;

	private deltaY: number;

	private shouldWheelX: any;

	private shouldWheelY: any;

	private stopPropagation: any;

	private onWheel: any;

	timer: Nullable<TimeoutHandle>;

	constructor(options: WheelOptions) {
		let { 
			onWheel, 
			shouldWheelX, 
			shouldWheelY, 
			stopPropagation,
			behavior
		} = options;

		if (typeof shouldWheelX !== 'function') {
			shouldWheelX = () => !!shouldWheelX;
		}

		if (typeof shouldWheelY !== 'function') {
			shouldWheelY = () => !!shouldWheelY;
		}

		if (typeof stopPropagation !== 'function') {
			stopPropagation = () => !!stopPropagation;
		}

		this.scrollBehavior = behavior === 'scroll';
		this.needThresholdWait = false;
		this.animationFrameID = null;
		this.deltaX = 0;
		this.deltaY = 0;
		this.shouldWheelX = shouldWheelX;
		this.shouldWheelY = shouldWheelY;
		this.stopPropagation = stopPropagation;
		this.onWheel = onWheel;
		this.didWheel = this.didWheel.bind(this);
	
		this.timer = null;
		this.handler = this.handler.bind(this);
		this.clear = this.clear.bind(this);
	}

	private didWheel() {
		this.animationFrameID = null;
		this.onWheel(this.deltaX, this.deltaY);
		this.deltaX = 0;
		this.deltaY = 0;
	}

	clear() {
		this.needThresholdWait = false;
	}

	handler(e: MouseEvent) {
		let normalizedEvent = normalizeWheel(e);
		let deltaX = this.deltaX + normalizedEvent.pixelX;
		let deltaY = this.deltaY + normalizedEvent.pixelY;
		let shouldWheelX = this.shouldWheelX(deltaX, deltaY);
		let shouldWheelY = this.shouldWheelY(deltaY, deltaX);
		if (!shouldWheelX && !shouldWheelY) {
			if (this.scrollBehavior && this.needThresholdWait) {
				e.preventDefault();
				this.timer && clearTimeout(this.timer);
				this.timer = setTimeout(this.clear, wait);
				timers.add(this);
			}
			return;
		}

		if (this.scrollBehavior) {
			this.timer && clearTimeout(this.timer);
			this.needThresholdWait = true;
		}

		this.deltaX += shouldWheelX ? normalizedEvent.pixelX : 0;
		this.deltaY += shouldWheelY ? normalizedEvent.pixelY : 0;
		// 阻止X，Y轴上的滚动时，父层滚动（mac下的父层滚动越界会带有回弹）
		e.preventDefault();

		let changed = false;
		if (this.deltaX !== 0 || this.deltaY !== 0) {
			if (this.stopPropagation()) {
				e.stopPropagation();
			}
			changed = true;
		}

		if (changed === true && this.animationFrameID === null) {
			this.animationFrameID = raf(this.didWheel);
		}
	}
}
