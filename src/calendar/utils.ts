import { Utils } from "@wya/utils";

// 创建每个月天数的数组
export const createDaysArray = (year, month, days, type) => {
	let array = [];
	for (let i = 0; i < days; i++) {
		let item = {};
		item.date = `${year}-${Utils.preZero(month)}-${Utils.preZero(i + 1)}`;
		item.day = i + 1;
		item.type = type;
		array.push(item);
	}
	return array;
};

// 获取某月的天数
export const getMonthDays = (year, month) => {
	let day = new Date(year, month, 0);
	return day.getDate();
};

// 根据日期判断是星期几
export const getWeek = (dateString) => {
	let date;
	if (!dateString) {
		date = new Date();
	} else {
		let dateArray = dateString.split("-");
		date = new Date(dateArray[0], parseInt(dateArray[1] - 1, 10), dateArray[2]);
	}

	// return "星期" + "日一二三四五六".charAt(date.getDay());
	return date.getDay();
};
		
export const getCurrentInfo = (year, month) => {
	let prevYear;
	let nextYear;
	let prevMonth;
	let nextMonth;
	let prevData;
	let curData;
	let nextData;

	// 处理下当前值
	if (month === 0) {
		year -= 1;
		month = 12;
	} else if (month === 13) {
		year += 1;
		month = 1;
	}

	prevYear = year;
	nextYear = year;
	prevMonth = month - 1;
	nextMonth = month + 1;

	// 处理前后值
	if (month === 1) {
		prevYear = year - 1;
		prevMonth = 12;
	} else if (month === 12) {
		nextYear = year + 1;
		nextMonth = 1;
	}

	prevData = createDaysArray(prevYear, prevMonth, getMonthDays(prevYear, prevMonth), "prev");
	curData = createDaysArray(year, month, getMonthDays(year, month), "current");
	nextData = createDaysArray(nextYear, nextMonth, getMonthDays(nextYear, nextMonth), "next");

	// 生成日历数组
	let firstWeek = getWeek(`${year}-${Utils.preZero(month)}-1`); // 本月第一天是星期几
	let data = [
		...prevData.slice(prevData.length - (firstWeek === 0 ? 7 : firstWeek), prevData.length),
		...curData,
		...nextData.slice(0, 42 - firstWeek - curData.length)
	];

	return {
		year,
		month,
		data
	};
};
