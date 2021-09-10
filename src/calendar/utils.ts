import { Utils } from "@wya/utils";
import type { DayOptions, Day, Year, Month } from './types';

// 创建每个月天数的数组
export const createDaysArray = (year: Year, month: Month, days: Day, type: string): DayOptions[] => {
	let array: DayOptions[] = [];
	for (let i = 0; i < days; i++) {
		let item: DayOptions = {};
		item.date = `${year}-${Utils.preZero(month)}-${Utils.preZero(i + 1)}`;
		item.day = i + 1;
		item.type = type;
		array.push(item);
	}
	return array;
};

// 获取某月的天数
export const getMonthDays = (year: Year, month: Month) => {
	let day = new Date(year as number, month as number, 0);
	return day.getDate();
};

// 根据日期判断是星期几
export const getWeek = (dateString: string): number => {
	let date: Date;
	if (!dateString) {
		date = new Date();
	} else {
		let dateArray: number[] = dateString.split("-").map(i => parseInt(i, 10));
		date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
	}
	// return "星期" + "日一二三四五六".charAt(date.getDay());
	return date.getDay();
};
		
export const getCurrentInfo = (year: Year, month: Month) => {
	let prevYear: number;
	let nextYear: number;
	let prevMonth: number;
	let nextMonth: number;
	let prevData: DayOptions[];
	let curData: DayOptions[];
	let nextData: DayOptions[];

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
