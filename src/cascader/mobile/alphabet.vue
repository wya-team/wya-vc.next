<template>
	<div class="vcm-cascader-alphabet vc-hack-scroll">
		<ul 
			ref="list"
			class="vcm-cascader-alphabet__list"
			@touchstart.stop="handleStart"
			@touchmove.stop="handleMove"
		>
			<li
				v-for="letter in alphabet"
				:key="letter"
				class="vcm-cascader-alphabet__item"
				@click="handleTap(letter)"
			>
				{{ letter }}
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { throttle } from 'lodash';

export default defineComponent({
	name: 'vcm-cascader-alphabet',
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		alphabet: {
			type: Array,
			default: () => ([])
		}
	},
	emits: ['update:modelValue', 'change'],
	setup(props, { emit }) {
		const list = ref();
		const startY = ref(0);
		const barHeight = ref(0);
		const screenTop = ref(0);

		const itemHeight = computed(() => {
			return barHeight.value / props.alphabet.length;
		});

		const initData = () => {
			const rect = list.value.getBoundingClientRect();
			barHeight.value = rect.height;
			screenTop.value = rect.top;
		};

		const handleTap = (letter: string) => {
			emit('update:modelValue', letter);
			emit('change', letter);
		};

		const handleStart = () => {
			initData();
		};

		const handleMove = throttle((e) => {
			const target = e.touches[0];
			// 不在有效滑动范围内的touchmove
			if (target.pageY < screenTop.value || target.pageY > screenTop.value + barHeight.value) return;
			
			const distance = target.pageY - screenTop.value;
			const index = Math.floor(distance / itemHeight.value);
			const letter = props.alphabet[index];
			if (letter !== props.modelValue) {
				emit('update:modelValue', letter);
				emit('change', letter);
			}
		}, 100);


		return {
			startY,
			barHeight,
			screenTop,

			handleTap,
			handleStart,
			handleMove
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-cascader-alphabet) {
	overflow-y: auto;
	position: absolute;
	top: 6px;
	right: 0;
	height: 100%;
	width: 36px;
	text-align: center;
	user-select: none;
	@include element(list) {
		list-style: none;
	}
	@include element(item) {
		font-size: 10px;
		line-height: 1.2;
		color: #5495f6;
		text-align: center;
	}
}
</style>
