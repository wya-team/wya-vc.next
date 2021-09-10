import { Device } from '@wya/utils';

export const IS_SERVER = typeof window === 'undefined';
export const IS_DEV = process.env.NODE_ENV === 'development';

export const WHEEL_EVENT_NAME = Device.firefox 
	? 'DOMMouseScroll' 
	: typeof window === 'object' && typeof window.onwheel !== 'undefined' // null or function
		? 'wheel' 
		: 'mousewheel';
