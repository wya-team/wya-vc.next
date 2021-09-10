<template>
	<div
		:id="elementId"
		ref="pswpElement"
		class="pswp"
		tab-index="-1"
		role="dialog"
		aria-hidden="true"
	>
		<div class="pswp__bg" />
		<div class="pswp__scroll-wrap">
			<div class="pswp__container">
				<div class="pswp__item" />
				<div class="pswp__item" />
				<div class="pswp__item" />
			</div>
			<div class="pswp__ui pswp__ui--hidden">
				<div class="pswp__top-bar">
					<div class="pswp__counter" />
					<button
						class="pswp__button pswp__button--close"
						title="关闭(Esc)"
					/>
					<!-- <button
						class="pswp__button pswp__button--share"
						title="Share"
					/> -->
					<button
						class="pswp__button pswp__button--fs"
						title="全屏"
					/>
					<button class="pswp__button pswp__button--zoom" title="缩放" />
					<vc-icon 
						type="rotate-right" 
						class="vc-imgs-preview-core__button" 
						title="向右旋转90度"
						@click="handleRotate(90)" 
					/>
					<!-- icon标签不能直接为svg, 否则会报错 -->
					<vc-icon 
						type="rotate-left" 
						class="vc-imgs-preview-core__button" 
						title="向左旋转90度"
						@click="handleRotate(-90)" 
					/>
					<template v-for="(action, index) in actionBar" :key="index">
						<vc-icon 
							:type="action.icon" 
							:title="action.name" 
							class="vc-imgs-preview-core__button"
							@click="action.onClick(photoSwipe, dataSource)" 
						/>
					</template>
					<div class="pswp__preloader">
						<div class="pswp__preloader__icn">
							<div class="pswp__preloader__cut">
								<div class="pswp__preloader__donut" />
							</div>
						</div>
					</div>
				</div>
				<div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
					<div class="pswp__share-tooltip" />
				</div>
				<button
					class="pswp__button pswp__button--arrow--left"
					title="上一张"
				/>
				<button
					class="pswp__button pswp__button--arrow--right"
					title="下一张"
				/>
				<div class="pswp__caption">
					<div 
						class="pswp__caption__center" 
						style="text-align: center"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, watch, computed, getCurrentInstance, onUnmounted } from 'vue';
import Portal from '../portal/index';
import Icon from '../icon/index';
import { photoSwipeEvents } from './constants';
import { VcInstance } from '../vc/index';

/**
 * visible 父级传递
 * show 当前组件内
 */
const wrapperComponent = defineComponent({
	name: "vc-imgs-preview-core",
	components: {
		'vc-icon': Icon
	},
	props: {
		elementId: String,
		// 图片源
		dataSource: Array,

		// ps 参数
		options: {
			type: Object,
			default: () => ({})
		},

		// ps 事件
		events: {
			type: Object,
			default: () => ({

			})
		},
		// 工具栏扩展
		actionBar: {
			type: Array,
			default: () => (VcInstance.config?.ImagePreview?.actionBar || [])
		},
	},
	emits: ['portal-fulfilled', 'close', 'ready'],
	setup(props, { emit }) {
		const instance = getCurrentInstance();
		const photoSwipe = ref(null);
		const pswpElement = ref(null);
		const responsiveImages = ref([]);
		const angle = ref(0);

		const images = computed(() => {
			return props.dataSource.map((item, index) => {
				if (typeof item === 'object') {
					return {
						w: 1200,
						h: 900,
						...item
					}; // 会被photoswiper所引用
				} else {
					return {
						src: item,
						thumbnail: item,
						title: `IMG_${index + 1}`,
						w: 1200,
						h: 900
					};
				}
			});
		});

		/**
		 * 事件处理
		 * 自动适配
		 * http://photoswipe.com/documentation/responsive-images.html
		 */
		const gettingData = ($instance, index) => {
			let { items } = photoSwipe.value;
			let item = items[index];
			if (item.src && !responsiveImages.value.includes(item.src)) {
				let img = new Image();
				img.src = item.src;
				img.onload = () => {
					responsiveImages.value.push(img);
					item.w = img.naturalWidth;
					item.h = img.naturalHeight;
					photoSwipe.value.updateSize(true);
				};
			}
		};

		const defaultEvent = { gettingData };

		/**
		 * 旋转
		 */
		const handleResetAngle = () => {
			angle.value = 0;
			document.querySelectorAll('.pswp__img').forEach(i => {
				i.style.transform = `rotate(0deg)`;
			});
		};

		const handleRotate = (newAngle) => {
			angle.value += newAngle;
			document.querySelectorAll('.pswp__img').forEach(i => {
				i.style.transform = `rotate(${angle.value}deg)`;
			});
		};

		/**
		 * 实例
		 */
		const initPhotoSwipe = async () => {
			/* eslint-disable */

			let PhotoSwipe = window.PhotoSwipe || await import("photoswipe");
			let PhotoSwipeUI_Default = window.PhotoSwipeUI_Default || await import("photoswipe/dist/photoswipe-ui-default");

			PhotoSwipe = PhotoSwipe.default ? PhotoSwipe.default : PhotoSwipe;
			PhotoSwipeUI_Default = PhotoSwipeUI_Default.default ? PhotoSwipeUI_Default.default : PhotoSwipeUI_Default;

			/* eslint-enable */

			// 实例
			photoSwipe.value = new PhotoSwipe(
				pswpElement.value, 
				PhotoSwipeUI_Default, 
				images.value,
				{
					...props.options,
					closeOnScroll: false,
				}
			);

			emit('ready', {
				instance: photoSwipe.value,
				dependencies: {
					'photoswipe': PhotoSwipe, 
					'photoswipe-ui-default': PhotoSwipeUI_Default
				}
			});

			photoSwipe.value.next = () => {
				handleResetAngle();
				photoSwipe.value.goTo(photoSwipe.value.getCurrentIndex() + 1);
			};

			photoSwipe.value.prev = () => {
				handleResetAngle();
				photoSwipe.value.goTo(photoSwipe.value.getCurrentIndex() - 1);
			};

			// 绑定事件
			photoSwipeEvents.forEach((event) => {
				const callback = props.events[event] || defaultEvent[event];
				if (callback || event === 'destroy') {
					photoSwipe.value.listen(event, (...args) => {
						if (callback) {
							args.unshift(instance);
							callback(...args);
						}
						// 关闭时，将当前的index给外部
						if (event === 'destroy') {
							let info = { current: photoSwipe.value.getCurrentIndex() };

							// 兼容Portal
							emit('portal-fulfilled', info);
							emit('close', info);
						}
					});
				}
			});

			// 初始化
			photoSwipe.value.init();
		};

		/**
		 * 销毁实例
		 */
		const destroyPhotoSwipe = () => {
			if (!photoSwipe.value) {
				return;
			}
			photoSwipe.value.close();
		};

		/**
		 * initPhotoSwipe(), 会造成动画异常，可能绘制影响
		 */
		onMounted(() => nextTick(initPhotoSwipe));
		onUnmounted(destroyPhotoSwipe);

		return {
			images,
			photoSwipe,
			pswpElement,
			handleRotate
		};
	}
});
export default wrapperComponent;

export const Func = new Portal(wrapperComponent, {
	promise: false
});

</script>
<style lang='scss'>
@import '../style/vars.scss';

@include block(vc-imgs-preview-core) {
	@include element(button) {
		width: 44px;
		height: 44px;
		position: relative;
		background: none;
		cursor: pointer;
		overflow: visible;
		-webkit-appearance: none;
		display: block;
		border: 0;
		padding: 0;
		margin: 0;
		float: right;
		opacity: 0.75;
		transition: opacity 0.2s;
		box-shadow: none;
		color: white;
		line-height: 44px;
		text-align: center;
		font-size: 16px
	}
}
</style>