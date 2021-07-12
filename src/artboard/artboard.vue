<template>
	<div class="vc-artboard"> 
		<canvas ref="canvas" />
	</div>
</template>
<script>
import { getCurrentInstance, defineComponent, watch, ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue';
import { Device } from '@wya/utils';

export default defineComponent({
	name: "vc-artboard",
	props: {
		// canvas配置参数
		options: Object,
		width: {
			type: Number,
			default: 0
		},
		height: {
			type: Number,
			default: 0
		},
	},
	setup(props) {
		const instance = getCurrentInstance();
		const { emit } = instance;
		const canvas = ref(null);
		const context = ref(null);  

		const w = ref(0);
		const h = ref(0);      
		const top = ref(0);
		const left = ref(0);      
		// 鼠标或手指按压标识
		const isPressed = ref(false);
		// 存储点信息
		const point = reactive({ 
			x: 0,
			y: 0
		}); 
		// 存储每一步快照的点信息
		const points = ref([]);
		// 存储撤销步骤快照的信息
		const undoSnapshots = ref([]);
		// 存储当前步骤快照的信息
		const currentSnapshots = ref([]);

		let optimizedMove;
		const initCanvas = () => {
			const $context = context.value;
			const $canvas = canvas.value;
			// 根据设备像素比优化canvas绘图
			const devicePixelRatio = window.devicePixelRatio;
			if (devicePixelRatio) {
				$canvas.style.width = `${w.value}px`;
				$canvas.style.height = `${h.value}px`;
				$canvas.height = h.value * devicePixelRatio;
				$canvas.width = w.value * devicePixelRatio;
				$context.scale(devicePixelRatio, devicePixelRatio);
			} else {
				$canvas.width = w.value;
				$canvas.height = h.value;
			}

			$context.shadowBlur = 1;
			$context.shadowColor = 'black';
			$context.lineWidth = 2;
			$context.strokeStyle = 'black';
			$context.lineCap = 'round';
			$context.lineJoin = 'round';
			Object.assign($context, props.options);
		};
		
		const getPoint = (e) => {
			if (Device.touch) {
				// 手机端没有e.layerX和e.offsetX
				e = e.touches[0];
				point.x = e.clientX - left.value;
				point.y = e.clientY - top.value;
			} else {
				point.x = e.layerX || e.offsetX;
				point.y = e.layerY || e.offsetY;
			}
			
			const x = point.x;
			const y = point.y;
			points.value.push({ x, y });
		};


		/**
		 * 清空画布
		 */
		const redraw = () => {
			context.value.clearRect(0, 0, w.value, h.value);
		};


		const draw = (step) => {
			step.forEach(($point, index) => {
				if (index === 0) {
					context.value.beginPath();
					context.value.moveTo($point.x, $point.y);
				} else {
					context.value.lineTo($point.x, $point.y);
					context.value.stroke();
				}
			});
		};

		// 步骤发生变化，向外暴露change事件
		const handleChange = () => {
			const current = currentSnapshots.value.length;
			const snapshots = [...currentSnapshots.value, ...undoSnapshots.value];
			let allowRedo = current < snapshots.length;
			let allowUndo = current !== 0;

			emit('change', { 
				snapshots,
				current,
				allowRedo,
				allowUndo
			});
		};


		/**
		 * 重置
		 */
		const reset = () => {
			redraw();
			undoSnapshots.value = [];
			currentSnapshots.value = [];
			handleChange();
		};
		
		const handleMove = (e) => {
			e.preventDefault();
			
			if (isPressed.value && canvas.value.contains(e.target)) {
				getPoint(e);
				context.value.lineTo(point.x, point.y);
				context.value.stroke();
			}
		};

		const handleStatrt = (e) => {
			e.preventDefault();
			isPressed.value = true;
			points.value = [];
			getPoint(e);
			context.value.beginPath();
			context.value.moveTo(point.x, point.y);
			handleMove(e); // 鼠标点击画点
		};

		const handleEnd = () => {
			undoSnapshots.value = [];
			currentSnapshots.value.push(points.value);
			handleChange();
		};


		const handleDrawEnd = () => {
			if (isPressed.value) {
				isPressed.value = false;
				handleEnd();
			}
		};

		

		/**
		 * 回退
		 */
		const undo = () => {
			if (!currentSnapshots.value.length) return;
			undoSnapshots.value.unshift(currentSnapshots.value.pop());
			redraw();
			currentSnapshots.value.forEach(step => {
				draw(step);
			});
			handleChange();
		};


		/**
		 * 撤销
		 */
		const redo = () => {
			if (!undoSnapshots.value.length) return;
			
			const step = undoSnapshots.value.shift();
			draw(step);
			currentSnapshots.value.push(step);
			handleChange();
		};

		const operateDOMEvents = (type) => {
			// 直接使用 canvas.value.addEventListener 赋值的fn执行的时候函数指向window
			let fn = type === 'add' ? document.addEventListener.bind(canvas.value) : document.removeEventListener.bind(canvas.value);
			
			if (Device.touch) {
				fn('touchstart', handleStatrt);
				fn('touchmove', optimizedMove);
				fn('touchend', handleEnd);
			} else {
				fn('mousedown', handleStatrt);
				fn('mousemove', optimizedMove);
				fn('mouseup', handleDrawEnd);
				fn('mouseleave', handleDrawEnd);
			}
		};

		const init = () => {
			const rect = canvas.value.getBoundingClientRect();
			w.value = props.width || rect.width;
			h.value = props.height || rect.height;
			top.value = rect.top;
			left.value = rect.left;
			context.value = canvas.value.getContext('2d');

			const requestAnimationFrame = window.requestAnimationFrame;
			optimizedMove = requestAnimationFrame ? e => {
				requestAnimationFrame(() => {
					handleMove(e);
				});
			} : handleMove;
			initCanvas();
			operateDOMEvents('add');
		};

		onMounted(() => {
			setTimeout(init, 0); // 兼容popup的动画延迟
		});

		onBeforeUnmount(() => operateDOMEvents('remove'));
		return {
			canvas,
			context,
			reset,
			undo,
			redo,
			redraw,
			draw
		};
	}
	
});
</script>
<style lang="scss">
.vc-artboard {
	width: 100%;
	height: 100%;
	canvas {
		width: 100%;
		height: 100%;
		cursor: crosshair;
		border: 1px solid #d3d3d3;
	}
}
</style>