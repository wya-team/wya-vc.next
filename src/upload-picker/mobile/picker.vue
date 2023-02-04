<!-- picker和dataSource必须要对应，否则会显示不出来 -->
<template>
	<div class="vcm-upload-picker">
		<template v-for="(picker, $index) in currentPicker" :key="`m-picker-${$index}`">
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
					class="vcm-upload-picker__item"
					@delete="handleDel(i, picker.type)"
				>
					<template #default="{ it }">
						<slot :it="it" :index="i" :name="picker.type" />
					</template>
				</component>
			</template>
			<vcm-sort-list
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
						class="vcm-upload-picker__item"
						@delete="handleDel(index, picker.type)"
					>
						<template #default="scopeData">
							<slot :it="scopeData.it" :index="scopeData.index" :name="picker.type" />
						</template>
					</component>
				</template>
			</vcm-sort-list>
			<vcm-upload
				v-show="!disabled && dynamicMax[picker.type] >= 1"
				v-bind="currentUploadOptions[picker.type]"
				:max="dynamicMax[picker.type]"
				class="vcm-upload-picker__upload"
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
						class="vcm-upload-picker__box"
					>
						<vc-icon type="mini-plus" style="font-size: 30px" />
					</div>
				</slot>
			</vcm-upload>
		</template>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { picker } from 'lodash';
import PickerMixin from '../picker-mixin';
import { VcInstance } from '../../vc/index';
import Upload from '../../upload/index.m';
import Fragment from '../../fragment/index';
import Icon from '../../icon/index';
import SortList from '../../sort-list/index.m';
import ImageItem from './item/image-item';
import VideoItem from './item/video-item';
import AudioItem from './item/audio-item';
import FileItem from './item/file-item';
import usePicker from '../use-picker';

export default defineComponent({
	name: "vcm-upload-picker",
	components: {
		'vc-fragment': Fragment,
		'vcm-upload': Upload,
		'vc-icon': Icon,
		'vcm-sort-list': SortList
	},
	mixins: [PickerMixin],
	setup(props) {
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
		return {
			currentPicker,
			...usePicker()
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-upload-picker) {
	display: flex;
	box-sizing: border-box;
	flex-wrap: wrap;
	@include share-rule(box) {
		width: 78px;
		height: 78px;
		border-radius: 2px;
		cursor: pointer;
	}
	@include element(item) {
		margin-right: 8px;
		margin-bottom: 8px;
		@include extend-rule(box);
	}
	@include element(delete) {
		@include commonFlexCc();
		position: absolute;
		top: 0px;
		right: 0px;
		width: 15px;
		height: 15px;
		font-size: 7px;
		background: rgba($color: #000000, $alpha: .3);
		color: #fff;
		border-radius: 2px;
		z-index: 10;
	}
	@include element(upload) {
		margin-right: 8px;
		margin-bottom: 8px;
	}
	@include element(box) {
		background-color: #F5F5F6;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		color: #999999;
		line-height: 1;
		@include extend-rule(box);
	}
	.vcm-sort-list > div {
		margin-right: 0;
		margin-bottom: 0;
		margin-top: 0;
		margin-left: 0;
	}
}
</style>