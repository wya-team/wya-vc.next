import {
	getCurrentInstance,
	reactive,
	computed,
	watchEffect,
	Transition, 
	TransitionGroup
} from 'vue';
import { useAttrs } from '../hooks';

export default () => {
	const instance = getCurrentInstance();
	const { props, attrs, emit } = instance;
	const its = useAttrs({ standard: false });
	const componentType = computed(() => {
		return props.group ? TransitionGroup : Transition;
	});

	const clearStyles = (el) => {
		Object.keys(props.styles).forEach(key => {
			const v = props.styles[key];
			v && el.style.removeProperty(
				key.replace(/([A-Z])/g, "-$1").toLowerCase()
			);
		});
		
		el.style.removeProperty("animation-duration");
		el.style.removeProperty("animation-delay");
	};
	
	/**
	 * 先脱离文档流, 不占用高度;
	 */
	const resetAbsolute = (el) => {
		props.group && (el.style.position = 'absolute');
	};

	const resetOrigin = (el) => {
		props.origin && (el.style.transformOrigin = props.origin);
	};

	const resetStyles = (el) => {
		resetOrigin(el);

		Object.keys(props.styles).forEach(key => {
			const v = props.styles[key];
			v && (el.style[key] = v);
		});
	};
	/**
	 * hooks
	 */
	const handleBeforeEnter = (el) => {
		let duration = props.duration.enter || props.duration;
		el.style.animationDuration = `${duration}s`;

		let delay = props.delay.enter || props.delay;
		el.style.animationDelay = `${delay}s`;

		resetStyles(el);

		// emit('before-enter', el);
		attrs.onBeforeEnter?.(el);
	};

	const handleEnter = (el) => {
		// emit('enter', el);
		attrs.onEnter?.(el);
	};

	const handleAfterEnter = (el) => {
		clearStyles(el);

		// emit('after-enter', el);
		attrs.onAfterEnter?.(el);
	};

	const handleBeforeLeave = (el) => {
		let duration = props.duration.leave || props.duration;
		el.style.animationDuration = `${duration}s`;

		let delay = props.delay.leave || props.delay;
		el.style.animationDelay = `${delay}s`;

		resetStyles(el);

		// emit('before-leave', el);
		attrs.onBeforeLeave?.(el);
	};

	/**
	 * 特殊处理
	 * 如果第二个参数为done, 且接收的话, 由用户管理结束
	 */
	const handleLeave = (el) => {
		resetAbsolute(el);
		
		// emit('leave', el);
		attrs.onLeave?.(el);

	};
	const handleAfterLeave = (el) => {
		clearStyles(el);

		// emit('after-leave', el);
		attrs.onAfterLeave?.(el);
	};

	return {
		componentType,
		resetStyles,
		resetAbsolute,
		its,
		listeners: {
			'before-enter': handleBeforeEnter,
			'enter': handleEnter,
			'after-enter': handleAfterEnter,
			'before-leave': handleBeforeLeave,
			'leave': handleLeave,
			'after-leave': handleAfterLeave
		}
	};
};
