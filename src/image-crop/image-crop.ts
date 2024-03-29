import { h, getCurrentInstance, defineComponent, computed, ref, watch, onMounted, onUpdated, onUnmounted } from 'vue';
import { Utils } from '@wya/utils';
import { retrieveImageURL, isTouchDevice, isFileAPISupported, isDataURL } from '../utils/utils';
import { IS_SERVER } from '../utils/constant';
import { Resize } from '../utils/resize';

export const draggableEvents = {
	start: ['touchstart', 'mousedown'],
	move: ['touchmove', 'mousemove'],
	end: ['touchend', 'touchcancel', 'mouseup']
};

// 绘制一个圆角矩形.
const drawRoundedRect = (context, x, y, width, height, borderRadius) => {
	if (borderRadius === 0) {
		context.rect(x, y, width, height);
	} else {
		const widthMinusRad = width - borderRadius;
		const heightMinusRad = height - borderRadius;
		context.translate(x, y);
		context.arc(
			borderRadius,
			borderRadius,
			borderRadius,
			Math.PI,
			Math.PI * 1.5
		);
		context.lineTo(widthMinusRad, 0);
		context.arc(
			widthMinusRad,
			borderRadius,
			borderRadius,
			Math.PI * 1.5,
			Math.PI * 2
		);
		context.lineTo(width, heightMinusRad);
		context.arc(
			widthMinusRad,
			heightMinusRad,
			borderRadius,
			Math.PI * 2,
			Math.PI * 0.5
		);
		context.lineTo(borderRadius, height);
		context.arc(
			borderRadius,
			heightMinusRad,
			borderRadius,
			Math.PI * 0.5,
			Math.PI
		);
		context.translate(-x, -y);
	}
};

export default {
	name: "vc-image-crop",
	props: {
		src: {
			type: [String, Object].concat(IS_SERVER ? [] : [File]), // File, Blob类型也可以
			required: true
		},

		// 放大的倍数
		scale: {
			type: Number,
			default: 1
		},

		// 旋转的角度倍数
		rotate: {
			type: Number,
			default: 0
		},

		// 裁剪的边框 [x, y]
		border: {
			type: [Number, Array],
			default: 20
		},

		// 裁剪的边框圆角
		borderRadius: {
			type: Number,
			default: 0
		},

		// 裁剪比例，如：16 / 9 (w / h)
		ratio: {
			type: Number,
			default: 1
		},

		// 这里仅仅是为了让外部的width和height值不干扰到里面, 或者使用inheritAttrs: false（不过这个还要监听下style和class）
		width: Number,
		height: Number,

		// 输出图片的大小
		destWidth: {
			type: Number,
			default: 750
		},

		// 裁剪区域高
		position: Object, 

		// 边框的背景色RGBA
		color: {
			type: Array,
			default: () => [0, 0, 0, 0.5]
		},

		// useCORS
		crossOrigin: {
			type: String,
			// ''. 'anonymous', 'use-credentials'
			default: 'anonymous',
			validator: v => /^(|anonymous|use-credentials)$/.test(v),
		},

		// 是否支持拖拽图片进来编辑
		disableDrop: {
			type: Boolean,
			default: false
		},
	},
	setup(props) {
		const instance = getCurrentInstance();
		const { emit } = instance;

		const canvas = ref();
		const drag = ref(false);
		const my = ref(null);
		const mx = ref(null);

		// 最终输出尺寸
		const destWidth = ref(props.destWidth);
		const destHeight = ref(props.destWidth / props.ratio);

		// 元素宽高，不会影响画布
		const elementWidth = ref(null);
		const elementHeight = ref(null);

		const image = ref({
			resource: null,
			x: 0.5,
			y: 0.5
		});

		/**
		 * 边框
		 */
		const getBorders = (border = props.border) => {
			return Array.isArray(border) ? border : [border, border];
		};


		/**
		 * x轴默认缩放
		 */
		const getXScale = () => {
			const canvasAspect = destWidth.value / destHeight.value;
			const imageAspect = image.value.width / image.value.height;

			return Math.min(1, canvasAspect / imageAspect);
		};
		/**
		 * y轴默认缩放
		 */
		const getYScale = () => {
			const canvasAspect = destHeight.value / destWidth.value;
			const imageAspect = image.value.height / image.value.width;

			return Math.min(1, canvasAspect / imageAspect);
		};

		/**
		 * 可外调用
		 * 获取裁剪的startX, startY, width, height [0, 1]
		 */
		const getCroppingRect = () => {
			const { scale } = props;

			const position = props.position || {
				x: image.value.x,
				y: image.value.y
			};
			const $width = (1 / scale) * getXScale();
			const $height = (1 / scale) * getYScale();

			const croppingRect = {
				x: position.x - $width / 2,
				y: position.y - $height / 2,
				width: $width,
				height: $height
			};

			let xMin = 0;
			let xMax = 1 - croppingRect.width;
			let yMin = 0;
			let yMax = 1 - croppingRect.height;
			/**
			 * 如果裁剪图像大于原图像，则需要更改
			 * 我们的最大和最小的x＆y允许图像出现在任何地方
			 * 到修剪矩形的边缘.
			 */
			const isLargerThanImage = $width > 1 || $height > 1;

			if (isLargerThanImage) {
				xMin = -croppingRect.width;
				xMax = 1;
				yMin = -croppingRect.height;
				yMax = 1;
			}

			return {
				...croppingRect,
				x: Math.max(xMin, Math.min(croppingRect.x, xMax)),
				y: Math.max(yMin, Math.min(croppingRect.y, yMax))
			};
		};


		/**
		 * 通过相对位置计算 实际的位置
		 */
		const calculatePosition = ($image, border) => {
			$image = $image || image.value;
			
			const { scale } = props;

			const [borderX, borderY] = getBorders(border);

			const croppingRect = getCroppingRect();

			const $width = $image.width * scale;
			const $height = $image.height * scale;

			let x = -croppingRect.x * $width;
			let y = -croppingRect.y * $height;

			x += borderX;
			y += borderY;

			return {
				x,
				y,
				height: $height,
				width: $width
			};
		};

		/**
		 * 绘制图片
		 */
		const paintImage = (context, $image, border) => {
			if ($image.resource) {
				const { rotate } = props;

				const position = calculatePosition($image, border);
				context.save();

				context.translate(context.canvas.width / 2, context.canvas.height / 2);
				context.rotate((rotate * Math.PI) / 180);
				context.translate( 
					-(context.canvas.width / 2), 
					-(context.canvas.height / 2)
				);

				context.scale(1, 1);
				// 在源图像上方显示目标图像
				context.globalCompositeOperation = 'destination-over';
				context.drawImage(
					$image.resource,
					position.x,
					position.y,
					position.width,
					position.height
				);

				context.restore();
			}
		};

		/**
		 * canvas外形尺寸
		 */
		const getDimensions = () => {
			const { rotate, border } = props;

			const $canvas = {};

			const [borderX, borderY] = getBorders(border);

			const canvasWidth = destWidth.value;
			const canvasHeight = destHeight.value;

			$canvas.width = canvasWidth;
			$canvas.height = canvasHeight;

			$canvas.width += borderX * 2;
			$canvas.height += borderY * 2;

			return {
				canvas: $canvas,
				rotate,
				border,
				width: elementWidth.value,
				height: elementHeight.value
			};
		};

		/**
		 * 初始的宽高
		 */
		const getInitialSize = ($width, $height) => {
			let newHeight;
			let newWidth;

			const canvasRatio = destHeight.value / destWidth.value;
			const imageRatio = $height / $width;

			if (canvasRatio > imageRatio) {
				newHeight = destHeight.value; // 高度占满
				newWidth = $width * (newHeight / $height);
			} else {
				newWidth = destWidth.value; // 宽度占满
				newHeight = $height * (newWidth / $width);
			}

			return {
				height: newHeight,
				width: newWidth
			};
		};

		/**
		 * 外部调用
		 * 基于原图绘制
		 * 返回一个HTMLCanvasElement，在另一个画布上绘制，或添加到DOM。
		 */
		const getImageToCanvas = () => {
			// 获取相对坐标
			const croppingRect = getCroppingRect();

			// 创建具有正确尺寸的画布
			const $canvas = document.createElement('canvas');

			$canvas.width = destWidth.value;
			$canvas.height = destHeight.value;

			// 在正确的位置绘制全尺寸图像,
			// 图像被截断到画布的大小.
			const context = $canvas.getContext('2d');

			context.translate($canvas.width / 2, $canvas.height / 2);
			context.rotate((props.rotate * Math.PI) / 180);
			context.translate(-($canvas.width / 2), -($canvas.height / 2));

			const { scale } = props;
			context.drawImage(
				image.value.resource, 
				-croppingRect.x * image.value.width * scale, 
				-croppingRect.y * image.value.height * scale,
				image.value.width * scale,
				image.value.height * scale
			);

			return $canvas;
		};

		/**
		 * 外部调用
		 * 基于当前画布大小绘制.
		 * 返回一个HTMLCanvasElement ，base64 -> canvas.toDataURL()
		 */
		const getImageScaledToCanvas = () => {
			const { width, height } = getDimensions();

			const $canvas = document.createElement('canvas');

			$canvas.width = width;
			$canvas.height = height;

			// 不要在这里绘制边框，因为它是生成的图像
			paintImage($canvas.getContext('2d'), { ...image.value }, 0, 1);

			return $canvas;
		};

		const getImage = (opts = {}) => {
			const { isNormal = true, filename = 'image', getFile = false } = opts;
			return Utils.canvas2file(
				isNormal ? getImageToCanvas() : getImageScaledToCanvas(), 
				{ filename, getFile }
			);
		};

		/**
		 * 绘制当前的canvas
		 */
		const paint = (context) => {
			let { borderRadius, color } = props;

			context.save();
			// 画布的参数，不影响容器
			context.scale(1, 1);
			context.translate(0, 0);
			// 填充色
			context.fillStyle = 'rgba(' + color.slice(0, 4).join(',') + ')';

			const dimensions = getDimensions();
			const [borderSizeX, borderSizeY] = getBorders(dimensions.border);
			const $height = dimensions.canvas.height;
			const $width = dimensions.canvas.width;

			// 将边框半径在零，宽度一半，高度一半之间
			borderRadius = Math.max(borderRadius, 0);
			borderRadius = Math.min(
				borderRadius,
				$width / 2 - borderSizeX,
				$height / 2 - borderSizeY
			);
			// 开始绘制
			context.beginPath();
			// 内，可能圆形
			drawRoundedRect(
				context,
				borderSizeX,
				borderSizeY,
				$width - borderSizeX * 2,
				$height - borderSizeY * 2,
				borderRadius
			);
			// 外，逆时针绘制
			context.rect($width, 0, -$width, $height);
			context.fill('evenodd');
			context.restore();
		};

		/**
		 * 图片载入完成，设置state中image的信息
		 */
		const handleImageReady = ($image) => {
			const imageState = getInitialSize($image.width, $image.height);
			imageState.resource = $image;
			imageState.x = 0.5;
			imageState.y = 0.5;

			drag.value = false;
			image.value = imageState;

			emit('image-ready');

			/**
			 * 回调，图片加载成功
			 */
			emit('load-success', imageState);
		};


		/**
		 * 生成图片
		 */
		const loadImageURL = (imageURL) => {
			const imageObj = new Image();
			imageObj.onload = handleImageReady.bind(null, imageObj);
			imageObj.onerror = instance.vnode.props.onLoadFail;
			/**
			 * 在HTML5中，一些 HTML 元素提供了对 CORS 的支持，
			 * 例如 <img> 和 <video> 均有一个跨域属性 (crossOrigin property)，
			 * 它允许你配置元素获取数据的 CORS 请求。 这些属性是枚举的，并具有以下可能的值：
			 */
			if (!isDataURL(imageURL)) { 
				props.crossOrigin && (imageObj.crossOrigin = props.crossOrigin); 
				imageObj.src = `${imageURL}?=${new Date().getTime()}`; // 强制不缓存
			} else {
				imageObj.src = imageURL;
			}
		};
		/**
		 * 图片文件，如event.target.files[index]
		 */
		const loadImageFile = (imageFile) => {
			const reader = new FileReader();
			reader.onload = e => loadImageURL(e.target.result);// 返回base64
			reader.readAsDataURL(imageFile);
		};

		/**
		 * 选择加载图片的方式
		 */
		const loadImage = ($image) => {
			if (!$image) return;
			if (isFileAPISupported && $image instanceof Blob) {
				loadImageFile($image);
			} else if (typeof $image === 'string') {
				loadImageURL($image);
			}
		};


		/**
		 * 按下，只作用于canvas区域
		 */
		const handleStart = (e) => {
			e = e || window.event;
			// 多指触控
			if (e.touches && e.touches.length > 1) return;
			// 如果e是touch事件，则preventDefault保持相应的鼠标事件也被稍后触发。去除
			e.preventDefault();
			drag.value = true;
			mx.value = null;
			my.value = null;
		};

		/**
		 * 抬起
		 * 由 drag.value 判断
		 */
		const handleEnd = () => {
			if (drag.value) {
				drag.value = false;
				emit('mouseup');
			}
		};

		/**
		 * 移动 作用于整个document
		 */
		const handleMove = (e) => {
			e = e || window.event;

			if (drag.value === false) {
				return;
			}
			// 多指触控
			if (e.touches && e.touches.length > 1) return;

			const mousePositionX = e.targetTouches
				? e.targetTouches[0].pageX
				: e.clientX;
			const mousePositionY = e.targetTouches
				? e.targetTouches[0].pageY
				: e.clientY;

			const newState = {
				mx: mousePositionX,
				my: mousePositionY
			};

			let { rotate, scale } = props;

			rotate %= 360;
			rotate = rotate < 0 ? rotate + 360 : rotate;

			if (mx.value && my.value) {
				mx.value -= mousePositionX;
				my.value -= mousePositionY;

				const $width = image.value.width * scale;
				const $height = image.value.height * scale;

				let { x: lastX, y: lastY } = getCroppingRect();

				lastX *= $width;
				lastY *= $height;

				// 计算向量
				const toRadians = degree => degree * (Math.PI / 180);
				const cos = Math.cos(toRadians(rotate));
				const sin = Math.sin(toRadians(rotate));

				const x = lastX + mx.value * cos + my.value * sin;
				const y = lastY + -mx.value * sin + my.value * cos;

				const relativeWidth = (1 / scale) * getXScale();
				const relativeHeight = (1 / scale) * getYScale();

				const position = {
					x: x / $width + relativeWidth / 2,
					y: y / $height + relativeHeight / 2
				};


				emit('position-change', position);

				image.value = { 
					...image.value,
					...position
				};
			}

			mx.value = newState.mx;
			my.value = newState.my;

			/**
			 * 移动回掉
			 */
			emit('mousemove', e);
		};

		/**
		 * e.preventDefault(); => allowDrop
		 */
		const handleDragOver = (e) => {
			// 对于touch端它属于touchmove事件
			e = e || window.event;
			// 多指触控
			if (e.touches && e.touches.length > 1) return;
			e.preventDefault();
		};

		/**
		 * 去除作用于canvas本身事件
		 */
		const handleDrop = (e) => {
			e = e || window.event;
			// 支持desktop下直接拖入图片
			if (!props.disableDrop && e.dataTransfer) {
				e.stopPropagation();
				e.preventDefault();
				const { files, items } = e.dataTransfer;

				if (files && files.length) { // 本地拖入
					emit('drop-file', e);
					loadImageFile(files[0]);
				} else if (items && items.length) { // 网页链接拖入
					retrieveImageURL(items, src => loadImage(src));
				}
			}
		};

		const refreshCanvasSize = () => {
			const dimensions = getDimensions();

			// canvas标签的width和height是画布实际宽度和高度
			canvas.value.width = dimensions.canvas.width;
			canvas.value.height = dimensions.canvas.height;
		};

		const refreshElementSize = () => {
			const [borderX, borderY] = getBorders();

			// TODO: css时处理
			const hasWidth = !!(canvas.value.style.getPropertyValue('width'));
			const hasHeight = !!(canvas.value.style.getPropertyValue('height'));

			if (hasWidth || (!hasWidth && !hasHeight)) {
				elementWidth.value = canvas.value.offsetWidth;
				elementHeight.value = (canvas.value.offsetWidth - borderX * 2) / props.ratio + borderY * 2;

				canvas.value.style.setProperty('height', elementHeight.value + 'px');
			} else if (hasHeight) {
				elementHeight.value = canvas.value.offsetHeight;
				elementWidth.value = (canvas.value.offsetHeight - borderY * 2) * props.ratio + borderX * 2;
				canvas.value.style.setProperty('width', elementWidth.value + 'px');
			}
		};

		// 需要注意的是不要给canvas直接带上width和height，否则会影响宽高计算
		onMounted(() => {
			if (!document) return;
			refreshElementSize();
			refreshCanvasSize();
			paint(canvas.value.getContext('2d'));
			loadImage(props.src);
			// 使用原生绑定 不区分移动端还是桌面端
			draggableEvents.move.forEach(eventName => {
				document.addEventListener(
					eventName,
					handleMove,
					false
				);
			});
			draggableEvents.end.forEach(eventName => {
				document.addEventListener(
					eventName,
					handleEnd,
					false
				);
			});

			Resize.on(canvas.value, refreshElementSize);
		});

		onUnmounted(() => {
			if (!document) return;

			// 不区分移动端还是桌面端
			draggableEvents.move.forEach(eventName => {
				document.removeEventListener(
					eventName,
					handleMove,
					false
				);
			});
			draggableEvents.end.forEach(eventName => {
				document.removeEventListener(
					eventName,
					handleEnd,
					false
				);
			});

			Resize.off(canvas.value, refreshElementSize);
		});

		watch(
			() => props.src,
			(next, pre) => {
				if (next && next != pre) {
					loadImage(next);
					emit('image-change', 'src');
				}
			}
		);

		[
			'position', 
			'scale', 
			'rotate',
			['drag', drag],
			['mx', mx],
			['my', my],
			['image', image]
		].forEach(item => {
			watch(
				() => (typeof item === 'string' ? props[item] : item[1].value), 
				() => {
					const context = canvas.value.getContext('2d');
					context.clearRect(0, 0, canvas.value.width, canvas.value.height);
					paint(context);
					paintImage(context, { ...image.value }, props.border);
					emit('image-change', typeof item === 'string' ? item : item[0]);
				}
			);
		});

		// 对外暴露方法
		if (instance && instance.proxy) {
			Object.assign(instance.proxy, {
				canvas,
				getDimensions,
				getImage,
				getImageToCanvas,
				getImageScaledToCanvas,
			});
		}

		const style = computed(() => {
			let v = {
				cursor: drag.value ? '-webkit-grabbing' : '-webkit-grab'
			};

			return v;
		});

		// 给元素绑定的事件，start由该元素控制，move/end由document控制，
		const on = {
			onDragover: handleDragOver,
			onDrop: handleDrop,
		};
		
		draggableEvents.start.forEach(eventName => {
			on[`on${eventName}`] = handleStart;
		});

		return () => {
			return h('canvas', {
				ref: v => canvas.value = v,
				draggable: true,
				style: style.value,
				...on
			});
		};
	}
};
