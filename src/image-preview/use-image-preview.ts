import { defineComponent, getCurrentInstance, computed } from 'vue';
import { Device } from '@wya/utils';
import { Func } from './core';
import { VcInstance } from '../vc/index';

export default () => {
	const instance = getCurrentInstance();
	const { props, emit } = instance;
	const images = computed(() => {
		return props.dataSource.map((item, index) => {
			if (typeof item === 'object') {
				return {
					...item
				};
			} else {
				return {
					src: item,
					thumbnail: item,
					title: `IMG_${index + 1}`
				};
			}
		});
	});

	const previewByPS = (e, index) => {
		const { elementId, dataSource, options, events } = props;
		let pos = {};
		try {
			const target = e.target; // 先得到pos, 否则getThumbBoundsFn再计划，target已变化（比如弹窗transition的影响）
			const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
			const rect = target.getBoundingClientRect();

			pos = { x: rect.left, y: rect.top + pageYScroll, w: rect.width };

		} catch (error) {
			console.log(error);
		}

		emit('open');
		Func.popup({
			elementId,
			dataSource,
			events,
			options: {
				...options,
				index,
				history: false,
				getThumbBoundsFn: () => pos,
			},
			onSure: (payload) => {
				emit('close', payload);
			},
			onClose: (payload) => {
				emit('close', payload);
			}
		});
	};

	const handleShow = (e, index) => {
		/**
		 * 渐进增强
		 */
		let { enhancer } = VcInstance.config.ImagePreview || {};

		enhancer = props.enhancer || enhancer || (() => false);
		enhancer(index, images.value, instance) || previewByPS(e, index);
	};

	const getImage = (item) => {
		return typeof item === 'object' 
			? (item.thumbnail || item.msrc || item.src || item)
			: item;
	};

	return {
		images,
		getImage,
		handleShow,
		previewByPS
	};
};