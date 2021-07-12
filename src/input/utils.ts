export const checkMaxlength = (value, maxlength) => {
	let charLength = (value.match(/[\x20-\x7e]/g) || []).length;
	let chineseLength = value.length - charLength;
	if ((charLength + chineseLength * 2) > maxlength * 2) {
		return false;
	}
	return true;
};

// 单字节换成双字节 maxlength 需要额外加的长度
export const getBytesLength = (value) => {
	let charArr = String(value).match(/[\x20-\x7e]/g) || [];
	let charLength = charArr.length;
	if (charLength % 2 === 0) {
		return charLength /= 2;
	} else {
		return (charLength + 1) / 2;
	}
};