export const checkLimits = (value, options = {}) => {
	let [min, max] = value instanceof Array ? value : [value];
	min = Math.max(options.min, min);
	min = Math.min(options.max, min);
	max = Math.max(options.min, min, max);
	max = Math.min(options.max, max);
	return [min, max];
};

// get
export const getPointerX = (e) => {
	return e.type.indexOf('touch') !== -1 ? e.touches[0].clientX : e.clientX;
};

export const getOffset = (pos, step) => {
	step = step.toString();
	let offset = pos % step;
	if (step < 1) {
		let multiple = 1;
		let m;
		try {
			m = step.split('.')[1].length;
		} catch (e) {
			m = 0;
		}
		multiple = 10 ** m;
		// 获取小数点位数，避免经度丢失
		offset = ((pos * multiple) % (step * multiple)) / multiple;
	}
	return offset;
};