import { onMounted, onBeforeUnmount } from 'vue';
import { IS_SERVER } from '../utils';

let isDragging = false;

const draggableEvents = {
	start: ['touchstart', 'mousedown'],
	move: ['touchmove', 'mousemove'],
	end: ['touchend', 'touchcancel', 'mouseup']
};

const eventOptions = { capture: true, passive: false };

export const useDraggable = (el, options) => {
	if (IS_SERVER) return;
	const handleMove = (e) => {
		if (options.drag) {
			if ('ontouchmove' in window) {
				e.preventDefault();
				e.clientX = e.touches[0].clientX;
				e.clientY = e.touches[0].clientY;
			}

			options.drag(e);
		}
	};
	const handleEnd = (e) => {
		draggableEvents.move.forEach($eventName => {
			document.removeEventListener($eventName, handleMove, eventOptions);
		});
		draggableEvents.end.forEach($eventName => {
			document.removeEventListener($eventName, handleEnd);
		});
		document.onselectstart = null;
		document.ondragstart = null;

		isDragging = false;

		if (options.end) {
			if ('ontouchmove' in window && typeof e.clientY === 'undefined') {
				e.clientX = e.changedTouches[0].clientX;
				e.clientY = e.changedTouches[0].clientY;
			}
			options.end(e);
		}
	};
	const handleStart = (e) => {
		if (isDragging) return;
		document.onselectstart = () => false;
		document.ondragstart = () => false;

		draggableEvents.move.forEach($eventName => {
			document.addEventListener($eventName, handleMove, eventOptions);
		});
		draggableEvents.end.forEach($eventName => {
			document.addEventListener($eventName, handleEnd);
		});

		isDragging = true;

		if (options.start) {
			if ('ontouchmove' in window) {
				e.preventDefault();
				e.clientX = e.touches[0].clientX;
				e.clientY = e.touches[0].clientY;
			}
			options.start(e);
		}
	};

	onMounted(() => {
		const element = typeof el === 'function' ? el() : el;
		// 使用原生绑定 不区分移动端还是桌面端
		draggableEvents.start.forEach(eventName => {
			element.addEventListener(eventName, handleStart);
		});
	});

	onBeforeUnmount(() => {
		const element = typeof el === 'function' ? el() : el;

		draggableEvents.start.forEach(eventName => {
			element.removeEventListener(eventName, handleStart);
		});

		draggableEvents.move.forEach($eventName => {
			document.removeEventListener($eventName, handleMove, eventOptions);
		});
		draggableEvents.end.forEach($eventName => {
			document.removeEventListener($eventName, handleEnd);
		});

		document.onselectstart = null;
		document.ondragstart = null;
	});
};
