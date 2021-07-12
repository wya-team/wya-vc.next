<template>
	<div 
		:class="{ 'is-error': it.status == 0}"
		class="vc-upload-image-item"
	>
		<slot :it="it">
			<vc-image 
				v-if="typeof it !== 'object'" 
				:src="it" 
				:class="imageClassName"
				fit="cover"
				class="vc-upload-image-item__content"
				@click="handlePreview"
			/>
			<div v-else :class="imageClassName" class="vc-upload-image-item__content">
				<vc-progress
					v-if="it.percent && it.percent != 100" 
					:percent="it.percent"
					:show-info="false"
					status="normal"
					style="width: 100%;padding: 0 5px"
				/>
				<p v-else-if="!it.url && it.percent == 100 && !it.errorFlag" style="line-height: 1; padding: 5px">
					服务器正在接收...
				</p>
				<div v-else-if="it.status == 0" style="padding: 5px">
					上传失败
				</div>
			</div>
			<!-- 上传失败或者成功后显示 -->
			<vc-icon 
				v-if="!disabled && (typeof it !== 'object' || it.status == 0)" 
				type="close-small" 
				class="vc-upload-picker__delete"
				@click="handleDel" 
			/>
		</slot>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import ImagePreview from '../../image-preview/index';
import { VcInstance } from '../../vc/index';
import Icon from '../../icon/index';
import Progress from '../../progress/index';
import Image from '../../image';

export default defineComponent({
	name: 'vc-upload-picker-image-item',
	components: {
		'vc-icon': Icon,
		'vc-progress': Progress,
		'vc-image': Image
	},
	props: {
		imageClassName: [String, Object, Array],
		disabled: Boolean,
		it: {
			type: [String, Object, File],
			default: ''
		},
		imagePreviewOptions: {
			type: Object,
			default: () => ({})
		},
		index: [String, Number],
		dataSource: {
			type: Array,
			default: () => ([])
		}
	},
	emits: ['open', 'close', 'delete'],
	setup(props, { emit }) {
		const instance = getCurrentInstance();
		// 拿到可预览的图片，供预览组件使用
		const getPreviewData = () => {
			return props.dataSource
				.filter(it => typeof it === 'string')
				.map((src) => src);
		};
		const previewByPS = (e, index) => {
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
			ImagePreview.open({
				visible: true,
				dataSource: getPreviewData(),
				options: {
					index,
					history: false,
					getThumbBoundsFn: () => pos
				},
				onSure: () => emit('close'),
				onClose: () => emit('close'),
			});
		};
		const handlePreview = (e) => {
			/**
			 * 渐进增强
			 */
			let { enhancer } = VcInstance.config.ImagePreview || {};

			enhancer = props.imagePreviewOptions.enhancer || enhancer || (() => false);
			let images = getPreviewData().map(item => ({ src: item }));
			enhancer(props.index, images, instance) || previewByPS(e, props.index);
		};
		
		const handleDel = () => {
			emit('delete');
		};

		return {
			handlePreview,
			handleDel
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vc-upload-image-item) {
	position: relative;
	display: flex;
	box-sizing: border-box;
	flex-wrap: wrap;
	background-color: #fafafa;
	@include when(error) {
		position: relative;
		color: #f42626;
		border: 1px solid #f42626;
	}
	@include element(content) {
		@include commonFlexCc();
		width: 100%;
		height: 100%;
		border-radius: 4px;
		background-size: cover;
		overflow: hidden;
		background-color: #F5F5F6;
	}
}
</style>
