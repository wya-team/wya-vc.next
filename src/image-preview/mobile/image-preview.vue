<template>
	<div
		class="vcm-image-preview"
		style="display: flex; flex-wrap: wrap"
	>
		<div
			v-for="(item, index) in dataSource"
			:key="index"
			:class="itemClassName"
			class="vcm-image-preview__item"
		>
			<slot
				:src="getImage(item)" 
				:index="index" 
				:show="handleShow" 
				name="row"
			>
				<vc-customer
					:src="getImage(item)"
					:index="index"
					:render="renderRow"
					:show="handleShow"
				/>
			</slot>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, h } from 'vue';
import BasicMixin from '../basic-mixin';
import Image from '../../image';
import useImagePreview from '../use-image-preview';

export default defineComponent({
	name: "vcm-image-preview-row",
	mixins: [BasicMixin],
	props: {
		renderRow: {
			type: Function,
			default: (props, parent) => {
				const { src, index, show } = props;
				return h(Image, {
					src,
					fit: "cover",
					onClick: e => show(e, index),
					style: "width: 78px; height: 78px;"
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
@import '../../style/vars.scss';

@include block(vcm-image-preview) {
	img {
		display: block;
	}
	@include element(item) { 
		box-sizing: border-box;
		cursor: pointer;
		position: relative;
		margin-bottom: 8px;
		margin-right: 8px; 
	}; 
}
</style>