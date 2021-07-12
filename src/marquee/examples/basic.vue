<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<vc-marquee :content="text" style="background: #f7f7f7" />
		<vc-marquee :content="text" autoplay style="background: #f7f7f7" />
		<br>
		<vc-marquee style="background: #f7f7f7">
			length: 5 - {{ text.repeat(5) }}
		</vc-marquee>
		<br>
		<br>
		<vc-marquee style="background: #f7f7f7">
			length: - 10 {{ text.repeat(10) }}
		</vc-marquee>
		<br>
		<vc-carousel 
			:height="18" 
			:draggable="false" 
			:t="1" 
			vertical 
			style="background: #f7f7f7"
		>
			<vc-carousel-item v-for="item in 3" :key="item">
				<h3>{{ item }}</h3>
			</vc-carousel-item>
		</vc-carousel>

		<vc-button @click="handleClick">
			弹窗动画干扰
		</vc-button>
	</div>
</template>
<script lang="jsx">
import { defineComponent, ref } from 'vue';
import Marquee from '..';
import Carousel from '../../carousel';
import Button from '../../button';
import Modal from '../../modal';

export default defineComponent({
	name: "vc-marquee-basic",
	components: {
		'vc-marquee': Marquee,
		'vc-carousel': Carousel,
		'vc-carousel-item': Carousel.Item,
		'vc-button': Button,
	},
	setup() {
		const text = ref('ABCDEFG');

		return {
			text,
			handleClick() {
				Modal.success({
					title: 'test',
					content: () => {
						return (
							<Marquee 
								content={text.value.repeat(10)}
							/>
						);
					}
				});

			}
		};
	}
});
</script>
