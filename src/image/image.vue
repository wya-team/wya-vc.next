<template>
	<div :style="its.style" :class="its.class" class="vc-image">
		<slot v-if="isLoading" name="placeholder">
			<div :class="{ 'is-auto': isAuto }" :style="pStyle" class="vc-image__placeholder" />
		</slot>
		<slot v-else-if="isError" name="error">
			<div class="vc-image__error">
				加载失败
			</div>
		</slot>
		<img
			v-else
			v-bind="its.attrs"
			:src="src"
			:style="style"
			:class="{ 'is-center': alignCenter }"
			class="vc-image__inner"
			v-on="its.listeners || {}"
		>
	</div>
</template>

<script lang="ts">
import { getCurrentInstance, defineComponent, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { DOM, $ } from '@wya/utils';
import { throttle } from 'lodash';
import IMGStore from './store';
import { IS_SERVER } from '../utils/constant';
import { useAttrs } from '../hooks';

const isSupportObjectFit = !IS_SERVER && document.documentElement.style.objectFit !== undefined;

const ObjectFit = {
	NONE: 'none',
	CONTAIN: 'contain',
	COVER: 'cover',
	FILL: 'fill',
	SCALE_DOWN: 'scale-down'
};

export default {
	name: 'vc-image',
	inheritAttrs: false,
	props: {
		src: String,
		fit: String,
		lazy: Boolean,
		wrapper: [Object, String],
	},
	emits: ['load', 'error'],
	setup(props, context) {
		const instance = getCurrentInstance();
		const { emit } = context;
		const its = useAttrs({ standard: false, exclude: ['onLoad', 'onError'] });
		const isLoading = ref(true);
		const isError = ref(false);
		const isActive = ref(!props.lazy);
		const isAuto = ref(false);
		const originW = ref(0);
		const originH = ref(0);
		const pStyle = ref({});
		const scroller = ref(null);

		const setScroller = () => {
			const { wrapper } = props;

			if (typeof wrapper === 'object') {
				scroller.value = wrapper;
			} else if (typeof wrapper === 'string') {
				scroller.value = document.querySelector(wrapper);
			} else {
				scroller.value = $(instance.vnode.el).getScroller();
			}
		};

		const initPlaceholder = () => {
			isAuto.value = instance.vnode.el.clientHeight === 1 || instance.vnode.el.clientWidth === 1;

			// el上是否有width和height
			let { width, height } = instance.vnode.el.style;

			if (width && height) return;

			let { w, h } = IMGStore.getSize(props.src, { 
				clientW: instance.vnode.el.clientWidth,
				clientH: instance.vnode.el.clientHeight,
				style: {
					width,
					height
				},
				wrapperW: scroller.value && scroller.value.clientWidth,
				// TODO
				wrapperH: scroller.value && scroller.value.clientHeight,
			});

			if (w && h) {
				pStyle.value = {
					width: `${w}px`,
					height: `${h}px`,
				};
			}
		};

		let handleLazyLoad;
		const removeLazyLoadListener = () => {
			if (!scroller.value || !handleLazyLoad) return;
			scroller.value.removeEventListener('scroll', handleLazyLoad);

			scroller.value = null;
			handleLazyLoad = null;
		};

		const addLazyLoadListener = () => {
			if (scroller.value) {
				handleLazyLoad = throttle(() => {
					if ($(scroller.value).contains(instance.vnode.el)) {
						isActive.value = true;
						removeLazyLoadListener();
					}
				}, 200);
				scroller.value.addEventListener('scroll', handleLazyLoad);
				handleLazyLoad();
			}
		};

		const handleLoad = (e, img) => {
			originW.value = img.naturalWidth || img.width;
			originH.value = img.naturalHeight || img.height;

			isLoading.value = false;

			emit('load', e, img, instance);

			IMGStore.add(props.src, {
				originW: originW.value,
				originH: originH.value,
			});
		};

		const handleError = (e, img) => {
			isLoading.value = false;
			isError.value = true;
			emit('error', e, img, instance);
		};

		const loadImage = () => {
			// reset status
			isLoading.value = true;
			isError.value = false;

			const img = new Image();
			img.onload = e => handleLoad(e, img);
			img.onerror = e => handleError(e, img);

			// bind html attrs
			Object.keys(its.value.attrs || {})
				.forEach(key => img.setAttribute(key, it.value.attrs[key]));

			img.src = props.src;
		};
		
		const hackFit = (fit) => {
			const {
				clientWidth: elW,
				clientHeight: elH
			} = instance.vnode.el;

			if (!originW.value || !originH.value || !elW || !elH) return {};

			const vertical = originW.value / originH.value < 1;

			if (fit === ObjectFit.SCALE_DOWN) {
				const isSmaller = originW.value < elW && originH.value < elH;
				fit = isSmaller ? ObjectFit.NONE : ObjectFit.CONTAIN;
			}

			switch (fit) {
				case ObjectFit.NONE:
					return { width: 'auto', height: 'auto' };
				case ObjectFit.CONTAIN:
					return vertical ? { width: 'auto' } : { height: 'auto' };
				case ObjectFit.COVER:
					return vertical ? { height: 'auto' } : { width: 'auto' };
				default:
					return {};
			}
		};

		const style = computed(() => {
			if (!props.fit) return;
			return isSupportObjectFit
				? { 'object-fit': props.fit }
				: hackFit(props.fit);
		});

		const alignCenter = computed(() => {
			return !isSupportObjectFit && props.fit !== ObjectFit.FILL;
		});

		watch(
			() => props.src,
			() => {
				isActive.value && loadImage();
			}
		);

		watch(
			() => isActive.value,
			(v) => {
				v && loadImage();
			}
		);

		onMounted(() => {
			setScroller();
			initPlaceholder();
			props.lazy
				? addLazyLoadListener()
				: loadImage();
		});

		onBeforeUnmount(() => {
			props.lazy && removeLazyLoadListener();
		});

		return {
			isLoading,
			isError,
			isActive,
			isAuto,
			originW,
			originH,
			pStyle,
			style,
			alignCenter,
			its
		};
	}
};
</script>

<style lang="scss">
@import '../style/vars.scss';

%size {
	width: 100%;
	height: 100%;
}

@include block(vc-image) {
	position: relative;
	display: inline-block;
	overflow: hidden;
	vertical-align: top;
	
	@include element(placeholder) {
		@extend %size;
		background: #f5f7fa;
		min-height: inherit;
		max-height: inherit;
		@include when(auto) {
			background: inherit;
		}
		&:after {
			content: "-"; // eslint-disable-line
			display: block;
			opacity: 0; 
			height: 1px;
			width: 1px;  
		}
	}

	@include element(error) {
		@extend %size;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 14px;
		color: #c0c4cc;
		vertical-align: middle;
	}

	@include element(inner) {
		@extend %size;
		display: block;

		@include when(center) {
			position: relative;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			display: block;
		}
	}
}
</style>