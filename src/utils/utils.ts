import { Utils } from '@wya/utils';
import { cloneDeep } from 'lodash';
import { IS_SERVER } from './constant';
import type {
	Raf,
	TreeLabel,
	TreeValue,
	TreeData,
	Exceptions,
	UidOptions,
	CompressOptions,
	FlattenDataOptions
} from './types';

const now = +(new Date());
let $index = 0;

/**
 * timestamp在某些场景下是有必要的
 */
export const getUid = (comp: string, options?: UidOptions) => {
	const { prefix = 'vc', timestamp = false } = options || {};

	return `${prefix}${`${comp ? `-${comp}` : ''}`}${timestamp ? `-${now}` : ''}-${++$index}`;
};

export const getParseDOM = (str: string): Document | null => {
	const parser = typeof DOMParser === 'undefined' ? null : new DOMParser();

	if (!parser) {
		return null;
	}
	return parser.parseFromString(str, 'text/html');
};

export const retrieveImageURL = (dataTransferItems: DataTransferItemList, callback: AnyFunction) => {
	for (let i = 0; i < dataTransferItems.length; i++) {
		let item = dataTransferItems[i];
		if (item.type === 'text/html') {
			item.getAsString(value => {
				// value = <img src="" ... /> 即网页拖入的值
				const doc = getParseDOM(value) as Document; // 生成一个document 类似iframe（但有区别）
				const img = doc.querySelector('img');
				if (img && img.src) {
					callback(img.src);
				}
			});
			break;
		}
	}
};

export const isTouchDevice = !!(
	typeof window !== 'undefined'
	&& typeof navigator !== 'undefined'
	&& ('ontouchstart' in window || navigator.msMaxTouchPoints > 0)
);

export const isFileAPISupported = typeof File !== 'undefined';

/**
 * 判断是否是url链接
 * 基于base64正则
 */
export const isDataURL = (str: string) => {
	if (str === null) {
		return false;
	}
	const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i;
	return !!str.match(regex);
};

/**
 * 获取源数据
 * [value, label, children]
 * value: Number or String -> '11' == 11
 */
export const getSelectedData = (value: TreeValue[] = [], source: TreeData[] = []) => {
	let label: TreeLabel[] = [];
	let data: TreeData[] = [];

	if (source.length !== 0) {
		if (source.some(i => !!i.children) || !(source[0] instanceof Array)) { // 联动
			value.reduce((pre, cur) => {
				let target = pre.find(it => it.value == cur) || {};
				data.push(target);
				label.push(target.label as string);
				return target.children || [];
			}, source);
		} else {
			value.forEach((item, index) => {
				if (!source[index]) return; // value的长度可能超过source
				let target = source[index].find((it: TreeData) => it.value == item);
				data.push(target);
				label.push(target.label);
			});
		}
	}

	return cloneDeep({
		value,
		label,
		data
	});
};

/**
 * Table, Tree-Select 组件有多处使用
 */
export const flattenData = (data: TreeData, options: FlattenDataOptions = {}): TreeData => {
	let result: TreeData = [];
	data.forEach((item: TreeData) => {
		if (item.children) {
			const { children, ...rest } = item;
			const items: TreeData = flattenData(children, options);
			result = result.concat(
				options.parent
					? [options.cascader ? item : rest].concat(items)
					: items
			);

		} else {
			result.push(item);
		}
	});
	return result;
};

export const getLabel = (data: TreeData, v: TreeValue): TreeLabel => {
	if (typeof v === 'undefined' || v === '') return '';
	let { label = '' } = data.find((i: TreeData) => i.value == v) || {};
	return label;
};
/**
 * 当前节点是否符合条件
 */
export const eleInRegExp = (el: HTMLElement, exceptions: Exceptions): boolean => {
	for (let i in exceptions) {
		if (exceptions[i].test(el[i])) {
			return true;
		}
	}
	return false;
};

/**
 * 合并字符串和对象为一个新的对象
 * query: 参数为字符串时的规则 如下
 * ['message','duration']
 */
export const getOption = (target: any[], query: string[] = []) => {
	let result = {};
	target.map((item, index) => {
		if (typeof item === 'object' && target.length === index + 1) {
			result = {
				...result,
				...item
			};
		} else {
			result[query[index]] = item;
		}
		return true;
	});
	return result;
};

/**
 * 查找对应的值
 * {a: {b: {c: 1}}}, a.b.c -> { o, k, v }
 */
export const getPropByPath = (obj: object, path: string) => {
	let target = obj;
	path = path.replace(/\[(\w+)\]/g, '.$1');
	path = path.replace(/^\./, '');

	let keyArr = path.split('.');
	let i = 0;

	for (let len = keyArr.length; i < len - 1; ++i) {
		let key = keyArr[i];
		if (key in target) {
			target = target[key];
		} else {
			throw new Error('[@wya/vc]: 无效路径!');
		}
	}
	// Oracle Key Vault?
	return {
		target,
		key: keyArr[i],
		value: target[keyArr[i]]
	};
};

/**
 * https://github.com/reduxjs/redux/blob/master/src/compose.js
 */
export const compose = (...funcs: AnyFunction[]): AnyFunction => {
	if (funcs.length === 0) {
		return arg => arg;
	}
	if (funcs.length === 1) {
		return funcs[0];
	}
	return funcs.reduce((a, b) => (...args) => a(b(...args)));
};

export const placement2mode = {
	left: 'left',
	right: 'right',
	bottom: 'up',
	top: 'down',
	center: '',
};

export const getComputedStyle = (el: HTMLElement, SIZING_STYLE: string[]) => {
	// 注: 服务端渲染为0, 在客服端激活前，展示端存在问题【高度不定】
	if (IS_SERVER) return {};
	const style = window.getComputedStyle(el);

	const boxSizing = style.getPropertyValue('box-sizing')
		|| style.getPropertyValue('-moz-box-sizing')
		|| style.getPropertyValue('-webkit-box-sizing');

	const paddingSize = parseFloat(style.getPropertyValue('padding-bottom'))
		+ parseFloat(style.getPropertyValue('padding-top'));

	const borderSize = parseFloat(style.getPropertyValue('border-bottom-width'))
		+ parseFloat(style.getPropertyValue('border-top-width'));

	const sizingStyle = SIZING_STYLE
		.map(key => `${key}:${style.getPropertyValue(key)}`)
		.join(';');

	return {
		sizingStyle,
		paddingSize,
		borderSize,
		boxSizing,
	};
};

// 正则内的特殊符号
const specialChar = ['?', '*', '$', '+', '^', '.', '\\'];
/**
 * 如果字符串内存在正则的符号，RegEx会报错，所以转义下
 * @param {*} str 
 */
export const escapeString = (str: string) => {
	let val = '';
	for (let char of str) {
		val += specialChar.includes(char) ? "\\" + char : char;
	}
	return val;
};

/**
 * dataURL转file
 */
export const dataURLtoFile = (dataUrl: string, filename: string, filetype = 'image/jpeg'): File => {
	// 获取到base64编码
	const arr = dataUrl.split(',');
	// 将base64编码转为字符串
	const bstr = window.atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n); // 创建初始化为0的，包含length个元素的无符号整型数组
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, {
		type: filetype,
	});
};

/**
 * compressImage
 */
export const compressImage = (options: CompressOptions) => {
	const { file, width, height, filetype = 'image/jpeg', encoderOptions } = options || {};
	return new Promise((resolve) => {
		// 压缩图片需要的元素和对象
		const img = new Image();
		const reader = new FileReader();
		reader.readAsDataURL(file as File);
		// 文件base64化，以便获知图片原始尺寸
		reader.onload = (e) => {
			img.src = (e.target as any).result as string;
		};
		// 缩放图片需要的canvas
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		// base64地址图片加载完毕后
		img.onload = () => {
			const originWidth = img.width;
			const originHeight = img.height;
			const maxWidth = width || originWidth;
			const maxHeight = height || originHeight;

			let targetWidth = originWidth;
			let targetHeight = originHeight;
			if (originWidth > maxWidth || originHeight > maxHeight) {
				if (originWidth / originHeight > maxWidth / maxHeight) { // 更宽
					targetWidth = maxWidth;
					targetHeight = Math.round(maxWidth * (originHeight / originWidth));
				} else {
					targetHeight = maxHeight;
					targetWidth = Math.round(maxHeight * (originWidth / originHeight));
				}
			}

			// canvas对图片缩放
			canvas.width = targetWidth;
			canvas.height = targetHeight;
			context.clearRect(0, 0, targetWidth, targetHeight);
			context.drawImage(img, 0, 0, targetWidth, targetHeight);
			const dataURL = canvas.toDataURL(filetype, encoderOptions); // 压缩图片
			const compressFile = Utils.base642Blob(dataURL, file.name);
			resolve(compressFile);
		};
	});
};

export const raf: Raf = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
