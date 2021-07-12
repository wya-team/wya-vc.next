<template>
	<div>
		<!-- 自定义 renderRow -->
		<vcm-image-preview :data-source="dataSource" :render-row="renderRow" />
		
		<!-- 自定义 renderRow -->
		<vcm-image-preview :data-source="dataSource">
			<template #row="it">
				<img 
					:key="it.index" 
					:src="it.src" 
					:style="{ width: '100px', height: '100px', borderRadius: '20px' }"
					@click="it.show"
				>
			</template>
		</vcm-image-preview>
		<vcm-image-preview :data-source="dataSource" />
		
		<span @click="handleClick">自定义预览</span>
	</div>
</template>
<script lang="jsx">
import { defineComponent, ref } from 'vue';
import ImagePreview from '../index.m';

export default defineComponent({
	name: "vcm-image-preview-basic",
	components: {
		'vcm-image-preview': ImagePreview
	},
	setup(props) {
		const dataSource = ref([
			{
				src: 'https://oss.ruishan666.com/image/xcx/180228/803943951788/裤子.png',
				title: 'Image 1',
				w: 1200,
				h: 900
			},
			{
				src: 'https://oss.ruishan666.com/image/xcx/180313/942990884682/10053600,2880,1800.jpg',
				title: 'Image 2',
				w: 1200,
				h: 900
			},
			{
				src: 'https://oss.ruishan666.com/image/xcx/180313/942990767112/10049533,2880,1800.jpg',
				title: 'Image 2',
				w: 1200,
				h: 900
			},
			{
				src: 'https://oss.ruishan666.com/image/xcx/180228/803943510611/衣服-01.png',
				title: 'Image 2',
				w: 1200,
				h: 900
			},
			{
				src: 'https://oss.ruishan666.com/image/xcx/180313/942996157518/10053669,2880,1800.jpg',
				title: 'Image 2',
				w: 1200,
				h: 900
			}

		]);
		const opts = ref({
			closeOnScroll: false
		});

		return {
			opts,
			dataSource,
			renderRow($props) {
				const { src, index, show } = $props; 
				return (
					<img 
						src={src} 
						key={index} 
						style={{ width: '100px', height: '100px', borderRadius: '50px' }}
						onClick={show} 
					/>
				);
			},
			handleClick(e) {
				let pos = {};
				try {
					const target = e.target; // 先得到pos, 否则getThumbBoundsFn再计划，target已变化
					const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
					const rect = target.getBoundingClientRect();

					pos = { x: rect.left, y: rect.top + pageYScroll, w: rect.width };

				} catch (error) {
					console.log(error);
				}
				ImagePreview.open({
					visible: true,
					dataSource: dataSource.value,
					options: {
						index: 2,
						history: false,
						getThumbBoundsFn: (index) => pos
					},
					onClose: (payload) => {
						console.log(payload);
					}
				});
			}
		};
	}
});
</script>
