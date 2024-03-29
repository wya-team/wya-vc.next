<template>
	<div
		:class="{ 'is-error': it.status == 0 }"
		class="vc-upload-picker-video-item"
	>
		<slot :it="it" :current="current">
			<div v-if="typeof it !== 'object'">
				<video
					:src="it"
					:controls="false"
					class="vc-upload-picker-video-item__content"
					style="background-color: #000;"
				/>
				<div class="vc-upload-picker-video-item__play" @click="handlePreview">
					<vc-icon type="toplay" class="vc-upload-picker-video-item__play-icon" />
				</div>
			</div>
			<div v-else class="vc-upload-picker-video-item__content">
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
import { defineComponent, computed } from 'vue';
import Icon from '../../icon/index';
import Progress from '../../progress/index';
import { VideoPreview } from '../preview/video';
import { VcInstance } from '../../vc';
import { VideoPreviewConfig } from '../types';

export default defineComponent({
	name: 'vc-upload-picker-video-item',
	components: {
		'vc-icon': Icon,
		'vc-progress': Progress
	},
	props: {
		disabled: Boolean,
		it: {
			type: [String, Object, File],
			default: ''
		},
		dataSource: {
			type: Array,
			default: () => ([])
		}
	},
	emits: ['delete'],
	setup(props, { emit }) {
		const current = computed(() => {
			if (props.it.status === 0) return -1;
			const v = props.dataSource.filter(i => i.status !== 0);

			return v.findIndex(i => {
				let a = i;
				let b = props.it;
				return a === b;
			});
		});

		const handlePreview = () => {
			const { enhancer } = VcInstance.config.VideoPreview || {} as VideoPreviewConfig;
			if (enhancer) {
				enhancer(props.it);
			} else {
				VideoPreview.popup({
					dataSource: [props.it]
				});
			}
		};
		const handleDel = () => {
			emit('delete');
		};

		return {
			current,
			handlePreview,
			handleDel
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vc-upload-picker-video-item) {
	position: relative;
	display: flex;
	box-sizing: border-box;
	flex-wrap: wrap;
	color: #515a6e;
	background-color: #fafafa;
	@include when(error) {
		position: relative;
		color: #f42626;
		border: 1px solid #f42626;
		@include when(mobile) {
			color: #515a6e;
			border: none;
		}
	}
	@include element(content) {
		@include commonFlexCc();
		width: 64px;
		height: 64px;
		border-radius: 4px;
		background-size: cover;
		overflow: hidden;
	}
	@include element(play) {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate3d(-50%, -50%, 0);
			width: 24px;
			height: 24px;
			border: 1px solid #fff;
			border-radius: 50%;
		}
	}
	@include element(play-icon) {
		margin-left: 2px;
		color: #fff;
	}
}
</style>
