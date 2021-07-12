<template>
	<div>
		<!-- 自定义 renderRow -->
		<vc-image-preview :data-source="dataSource" :render-row="renderRow" />
		
		<!-- 自定义 renderRow -->
		<vc-image-preview :data-source="dataSource">
			<template #row="it">
				<img 
					:key="it.index" 
					:src="it.src" 
					:style="{ width: '100px', height: '100px', borderRadius: '20px' }"
				>
			</template>
		</vc-image-preview>

		<!-- 自定义 operate -->
		<vc-image-preview :data-source="dataSource">
			<template #operate="it">
				<div @click="it.show($event, it.index)">
					{{ it.index }}
				</div>
			</template>
		</vc-image-preview>
		<span @click="handleClick">自定义预览</span>
	</div>
</template>
<script lang="jsx">
import { defineComponent, ref } from 'vue';
import ImagePreview from '..';

export default defineComponent({
	name: "vc-image-preview-basic",
	components: {
		'vc-image-preview': ImagePreview
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
			dataSource,
			opts,
			renderRow($props) {
				const { src, index } = $props; 
				return (
					<img 
						src={src} 
						key={index} 
						style={{ width: '100px', height: '100px', borderRadius: '50px' }} 
					/>
				);
			},
			handleClick(e) {
				let pos = {};
				try {
					const target = e.target; // 先得到pos, 否则getThumbBoundsFn再计划，target已变化（比如弹窗transition的影响）
					const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
					const rect = target.getBoundingClientRect();

					pos = { x: rect.left, y: rect.top + pageYScroll, w: rect.width };

					console.log(pos);
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
					}
				});
			}
		};
	}
});
</script>
