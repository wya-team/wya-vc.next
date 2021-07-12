<template>
	<div class="vc-marquee">
		<div 
			:style="style" 
			:class="{ 'is-paused': paused }" 
			class="vc-marquee__content"
		>
			<slot>
				<div 
					v-if="typeof content === 'string'"
					v-html="content"
				/>
				<vc-customer 
					v-else-if="typeof content === 'function'" 
					:render="content" 
				/>
			</slot>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted, getCurrentInstance } from 'vue';
import { Load } from '@wya/utils';
import { getUid, TRANSFORM_KEBAB, ANIMATION } from '../utils';
import Customer from '../customer';

export default defineComponent({
	name: 'vc-marquee',
	components: {
		'vc-customer': Customer,
	},
	props: {
		// 每秒移动多少px
		speed: {
			type: Number,
			default: 50,
		},
		content: [String, Function],
		animated: {
			type: Boolean,
			default: true,
		},
		autoplay: {
			type: Boolean,
			default: false
		}
	},
	setup(props) {
		const instance = getCurrentInstance();
		const duration = ref(0);
		const elW = ref(0);
		const contentW = ref(0);
		const marqueeId = ref(getUid('marquee'));

		const paused = computed(() => {
			return !props.animated || (!props.autoplay && contentW.value < elW.value);
		});

		const style = computed(() => {
			return {
				[ANIMATION]: `${marqueeId.value} ${duration.value}s linear 0s ${paused.value ? 'paused' : 'running'} infinite` 
			};
		});

		const refresh = () => {
			elW.value = instance.vnode.el.offsetWidth;
			contentW.value = instance.vnode.el.firstChild.offsetWidth;

			if (paused.value) return;

			const FROM = `from { ${TRANSFORM_KEBAB}: translateX(${elW.value}px) }`;
			const TO = `to { ${TRANSFORM_KEBAB}: translateX(-${contentW.value}px) }`;

			Load.cssCode(`@keyframes ${marqueeId.value} { ${FROM} ${TO} }`);

			duration.value = (elW.value + contentW.value) / props.speed;
		};

		// TODO: content render和slot下也支持重置
		['content', 'speed'].forEach((key) => {
			watch(() => props[key], refresh);
		});

		onMounted(() => {
			// 兼容Portal前动画延迟
			setTimeout(refresh, 0);
		});

		return {
			duration,
			elW,
			contentW,
			paused,
			style,
			refresh
		};
	}
});
</script>

<style lang="scss">

@import '../style/vars.scss';

$block: vc-marquee;

@include block($block) {
	white-space: nowrap;
	overflow: hidden;
	@include element(content) {
		display: inline-block;
		@include when(paused) {
			animation-play-state: paused;
		}
	}
}

</style>