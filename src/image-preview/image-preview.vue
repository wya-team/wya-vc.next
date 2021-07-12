<template>
	<div
		class="vc-image-preview"
		style="display: flex; flex-wrap: wrap"
	>
		<div
			v-for="(item, index) in dataSource"
			:key="index"
			:class="itemClassName"
			class="vc-image-preview__item"
		>
			<slot
				:src="getImage(item)" 
				:index="index" 
				name="row"
			>
				<vc-customer
					:src="getImage(item)"
					:index="index"
					:render="renderRow"
					:row-style="rowStyle"
				/>
			</slot>
			<div class="vc-image-preview__mask">
				<slot 
					:src="getImage(item)" 
					:index="index" 
					:show="handleShow" 
					name="operate"
				>
					<vc-icon type="preview" @click.stop="handleShow($event, index)" />
				</slot>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, h } from 'vue';
import BasicMixin from './basic-mixin';
import Image from '../image';
import useImagePreview from './use-image-preview';

export default defineComponent({
	name: "vc-image-preview-row",
	mixins: [BasicMixin],
	props: {
		renderRow: {
			type: Function,
			default: (props, parent) => {
				const { src, index, rowStyle } = props;
				return h(Image, {
					src,
					fit: "cover",
					style: rowStyle
				});
			}
		}
	},
	setup(props) {
		return useImagePreview();
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-image-preview) {
	.vc-image__inner{
		display: block;
		width: 100px;
		height: 100px;
	}
	@include element(item) { 
		box-sizing: border-box;
		cursor: pointer;
		position: relative;
		margin-bottom: 5px;
		margin-right: 5px; 
		font-size: 0;
		&:hover {
			@include element(mask) {
				transition: opacity 0.5s;
				opacity: 1;
				font-size: 12px;
			}
		}
	}; 
	@include element(mask) {
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-sizing: border-box;
		& > span {
			cursor: pointer;
			font-size: 18px;
		}
	}
}
</style>