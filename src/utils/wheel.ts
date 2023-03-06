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
	const handleAddEvent = () => {
		document.body.addEventListener('wheel', handler, true);
		document.body.addEventListener('mousedown', handler, true);
	};
	if (document.body) {
		handleAddEvent();
	} else {
		window.addEventListener("DOMContentLoaded", handleAddEvent);
	}
}


const getAngle = (start: number[], end: number[]) => {
	let dx = end[0] - start[0];
	let dy = end[1] - start[1];

	return Math.abs((360 * Math.atan(dy / dx)) / (2 * Math.PI));
};

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

	private isTouching: boolean;

	private startTime: Nullable<Date>;

	private startX: number;

	private startY: number;

	private moveX: number;

	private moveY: number;

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
		this.isTouching = false;
		this.startTime = null;

		this.startX = 0;
		this.startY = 0;

		this.moveX = 0;
		this.moveY = 0;

		this.handler = this.handler.bind(this);
		this.handleTouchStart = this.handleTouchStart.bind(this);
		this.handleTouchMove = this.handleTouchMove.bind(this);
		this.handleTouchEnd = this.handleTouchEnd.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);

		this.clear = this.clear.bind(this);
	}

	private didWheel() {
		this.animationFrameID = null;
		this.onWheel(this.deltaX, this.deltaY);
		this.deltaX = 0;
		this.deltaY = 0;
	}

	private operateDOMEvents(el, type) {
		if (typeof document === 'undefined') return;
		let fn = (type === 'add' ? el.addEventListener : el.removeEventListener).bind(el);
		if ('ontouchend' in document) {
			// 让触控屏也能实现滑动(模拟)
			fn('touchstart', this.handleTouchStart, false);
			fn('touchmove', this.handleTouchMove, { passive: false });
			fn('touchend', this.handleTouchEnd, false);
		} else {
			// 模拟鼠标滚轮点击
			fn('mousemove', this.handleMouseMove, false);
		}
	}

	clear() {
		this.needThresholdWait = false;
	}

	// Start 兼容vue指令中三个钩子
	beforeMount(el, binding) {
		this.operateDOMEvents(el, 'add');
	}

	updated(el, binding) {

	}

	unmounted(el, binding) {
		this.operateDOMEvents(el, 'remove');
	}
	// End 

	handleMouseMove(e) {
		if (e.which === 2) {
			this.emitScroll(e, {
				x: e.movementX, 
				y: e.movementY
			});
		}
	}

	handleTouchStart(e) {
		this.isTouching = true;

		const x = e.touches[0].screenX;
		const y = e.touches[0].screenY;

		this.startX = x;
		this.startY = y;

		this.moveX = x;
		this.moveY = y;

		this.startTime = Date.now();
	}

	handleTouchMove(e) {
		const x = e.touches[0].screenX;
		const y = e.touches[0].screenY;

		const dx = this.moveX - x;
		const dy = this.moveY - y;

		this.moveX = x;
		this.moveY = y;

		this.emitScroll(e, {
			x: dx, 
			y: dy,
			angle: getAngle([this.startX, this.startY], [this.moveX, this.moveY])
		});
	}

	handleTouchEnd(e) {
		this.isTouching = false;

		const x = e.changedTouches[0].screenX;
		const y = e.changedTouches[0].screenY;

		const angle = getAngle([this.startX, this.startY], [x, y]);

		const dt = Date.now() - this.startTime;
		if (dt <= 500 && dt > 50) {
			const dx = this.startX - x;
			const dy = this.startY - y;
			const speedX = dx / dt;
			const speedY = dy / dt;

			// 相当于再移动speed * 300的距离
			for (let i = 0; i <= 300; i++) {
				setTimeout(() => {
					this.emitScroll(e, {
						x: speedX, 
						y: speedY,
						angle
					});
				}, i);
			}
		}
	}

	// 滚轮事件触发
	handler(e: MouseEvent) {
		let { pixelX, pixelY } = normalizeWheel(e);
		
		this.emitScroll(e, {
			x: pixelX, 
			y: pixelY
		});
	}

	/**
	 * 在emitScroll之前:
	 * 滑动手势X轴偏移小于30度夹角，禁止移动Y轴 -> pixelY = 0
	 * 滑动手势Y轴偏移小于30度夹角，禁止移动X轴 -> pixelX = 0
	 */
	emitScroll(e, options) {
		let { x: pixelX, y: pixelY, angle } = options || {};

		if (typeof angle !== 'undefined') {
			angle < 30 && (pixelY = 0);
			angle > 60 && (pixelX = 0);
		}

		let deltaX = this.deltaX + pixelX;
		let deltaY = this.deltaY + pixelY;
		let shouldWheelX = this.shouldWheelX(deltaX, deltaY);
		let shouldWheelY = this.shouldWheelY(deltaY, deltaX);
		if (!shouldWheelX && !shouldWheelY) {
			if (this.scrollBehavior && this.needThresholdWait) {
				e.cancelable && e.preventDefault();
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

		this.deltaX += shouldWheelX ? pixelX : 0;
		this.deltaY += shouldWheelY ? pixelY : 0;
		// 阻止X，Y轴上的滚动时，父层滚动（mac下的父层滚动越界会带有回弹）
		e.cancelable && e.preventDefault();

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
