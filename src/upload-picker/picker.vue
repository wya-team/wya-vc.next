<!-- picker和dataSource必须要对应，否则会显示不出来 -->
<template>
	<div class="vc-upload-picker">
		<template v-for="(picker, $index) in currentPicker" :key="`picker-${$index}`">
			<template v-if="!sortable">
				<component
					:is="picker.item"
					v-for="(item, i) in currentValue[picker.type]"
					:key="typeof item === 'object' ? item.uid : item"
					:it="item"
					:disabled="disabled"
					:image-preview-options="imagePreviewOptions"
					:image-class-name="imageClassName"
					:video-class-name="videoClassName"
					:audio-class-name="audioClassName"
					:file-class-name="fileClassName"
					:url-key="urlKey"
					:index="i"
					:data-source="currentValue[picker.type]"
					class="vc-upload-picker__item"
					@delete="handleDel(i, picker.type)"
				>
					<template #default="{ it }">
						<slot :it="it" :index="i" :name="picker.type" />
					</template>
				</component>
			</template>
			<vc-sort-list
				v-else 
				:data-source="currentValue[picker.type]" 
				:mask="mask" 
				value-key="uid" 
				class="is-sort"
				@change="(...args) => handleSortChange(...args ,picker.type)"
			>
				<template #default="{ it, index }">
					<component
						:is="picker.item"
						:key="typeof it === 'object' ? it.uid : it"
						:it="it"
						:disabled="disabled"
						:image-preview-options="imagePreviewOptions"
						:image-class-name="imageClassName"
						:video-class-name="videoClassName"
						:audio-class-name="audioClassName"
						:file-class-name="fileClassName"
						:url-key="urlKey"
						:index="index"
						:data-source="currentValue[picker.type]"
						class="vc-upload-picker__item"
						@delete="handleDel(index, picker.type)"
					>
						<template #default="scopeData">
							<slot :it="scopeData.it" :index="scopeData.index" :name="picker.type" />
						</template>
					</component>
				</template>
			</vc-sort-list>
			<vc-upload
				v-show="!disabled && multiple[picker.type]"
				v-bind="currentUploadOptions[picker.type]"
				:max="dynamicMax[picker.type]"
				:multiple="multiple[picker.type]"
				class="vc-upload-picker__upload"
				@file-before="(...args) => handleFileBefore(...args, picker.type)"
				@file-start="(...args) => handleFileStart(...args, picker.type)"
				@file-progress="(...args) => handleFileProgress(...args, picker.type)"
				@file-success="(...args) => handleFileSuccess(...args, picker.type)"
				@file-error="(...args) => handleFileError(...args, picker.type)"
				@error="(...args) => handleError(...args, picker.type)"
				@complete="(...args) => handleFileComplete(...args, picker.type)"
			>
				<slot :name="`${picker.type}-upload`">
					<div 
						:class="[boxClassName]"
						class="vc-upload-picker__box"
						@click="handleClick($event, picker.type)"
					>
						<vc-icon type="mini-plus" class="vc-upload-picker__plus-icon" />
						<span style="margin-top: 8px">上传</span>
					</div>
				</slot>
			</vc-upload>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, computed } from 'vue';
import { picker } from 'lodash';
import PickerMixin from './picker-mixin';
import { VcInstance } from '../vc/index';
import Upload from '../upload/index';
import Icon from '../icon/index';
import SortList from '../sort-list/index';
import ImageItem from './item/image-item';
import VideoItem from './item/video-item';
import AudioItem from './item/audio-item';
import FileItem from './item/file-item';
import usePicker from './use-picker';

export default defineComponent({
	name: "vc-upload-picker",
	components: {
		'vc-upload': Upload,
		'vc-icon': Icon,
		'vc-sort-list': SortList
	},
	mixins: [PickerMixin],
	props: {
		// PC端特有
		gallery: {
			type: [Function, Boolean],
			default: true
		}
	},
	setup(props) {
		const instance = getCurrentInstance();
		const currentPicker = computed(() => {
			return props.picker.reduce((pre, cur) => {
				switch (cur) {
					case 'image':
						pre.push({
							type: cur,
							item: ImageItem
						});
						return pre;
					case 'video':
						pre.push({
							type: cur,
							item: VideoItem
						});
						return pre;
					case 'audio':
						pre.push({
							type: cur,
							item: AudioItem
						});
						return pre;
					case 'file':
						pre.push({
							type: cur,
							item: FileItem
						});
						return pre;
					default:
						return pre;
				}
			}, []);
		});

		const handleClick = (e, type) => {
			const { UploadPicker = {} } = VcInstance.config;
			if (typeof props.gallery === 'function' || (props.gallery && UploadPicker.gallery)) {

				let fn = typeof props.gallery === 'function' 
					? props.gallery
					: UploadPicker.gallery;
				
				// 阻止原生事件，如video, file不走gallery, 可以跳过;
				fn(instance, type) && e.stopPropagation();
			} 
		};

		return {
			currentPicker,
			handleClick,
			...usePicker()
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-upload-picker) {
	display: flex;
	box-sizing: border-box;
	flex-wrap: wrap;
	@include share-rule(box) {
		width: 64px;
		height: 64px;
		border-radius: 4px;
		cursor: pointer;
	}
	@include element(item) {
		margin-right: 12px;
		margin-bottom: 12px;
		@include extend-rule(box);
	}
	@include element(delete) {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 14px;
		height: 14px;
		border-radius: 7px;
		background-color: #5495F6;
		color: #ffffff;
		font-size: 14px;
		z-index: 1;
	}
	@include element(upload) {
		margin-right: 12px;
		margin-bottom: 12px;
	}
	@include element(box) {
		background-color: #F5F5F6;
		border: 1px dashed #D9D9D9;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		color: #999999;
		line-height: 1;
		@include extend-rule(box);
	}
	@include element(plus-icon) {
		font-size: 14px;
	}
	.vc-sort-list > div {
		margin-right: 0;
		margin-bottom: 0;
		margin-top: 0;
		margin-left: 0;
	}
}
</style>