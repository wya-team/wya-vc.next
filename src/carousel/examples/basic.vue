<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<div>
			<span>默认 Hover 指示器触发</span>
			<vc-carousel :height="150">
				<vc-carousel-item v-if="showFirst">
					<h3>动态: 应该出现在第一个</h3>
				</vc-carousel-item>
				<vc-carousel-item v-for="item in 4" :key="`item_${item}`">
					<h3>{{ item }}</h3>
				</vc-carousel-item>
				<vc-carousel-item v-if="showLast">
					<h3>动态: 应该出现在最后一个</h3>
				</vc-carousel-item>
			</vc-carousel>
		</div>
		<br>
		<br>
		<br>
		<div>
			<vc-carousel :t="4" :height="200" type="card">
				<vc-carousel-item v-for="item in 6" :key="item">
					<h3 class="medium">
						{{ item }}
					</h3>
				</vc-carousel-item>
			</vc-carousel>
		</div>
		<br>
		<br>
		<br>
		<div>
			<vc-carousel :autoplay="false" :height="200" vertical>
				<vc-carousel-item v-for="item in 3" :key="item">
					<h3 class="medium">
						{{ item }}
					</h3>
				</vc-carousel-item>
			</vc-carousel>
		</div>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Carousel from '..';

export default defineComponent({
	name: "vc-carousel-basic",
	components: {
		'vc-carousel': Carousel,
		'vc-carousel-item': Carousel.Item,
	},
	setup() {
		const showFirst = ref(false);
		const showLast = ref(false);
		setTimeout(() => showLast.value = true, 500);
		setTimeout(() => showFirst.value = true, 1000);
		return {
			showFirst,
			showLast
		};
	}
});
</script>
<style>
.vc-carousel-item h3 {
	color: #475669;
	font-size: 14px;
	opacity: 0.75;
	line-height: 150px;
	margin: 0;
}

.vc-carousel-item:nth-child(2n) {
	background-color: #99a9bf;
}

.vc-carousel-item:nth-child(2n+1) {
	background-color: #d3dce6;
}
</style>
