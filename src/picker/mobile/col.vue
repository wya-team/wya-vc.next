<template>
	<div
		v-event:touchstart.prevent.stop="e => handleStart(e.touches[0].screenY)"
		v-event:touchmove.prevent.stop="e => handleMove(e.touches[0].screenY)"
		v-event:touchend.prevent.stop="e => handleEnd(e.changedTouches[0].screenY)"
		v-event:mousedown.prevent.stop="e => handleStart(e.screenY)"
		v-event:mousemove.prevent.stop="e => handleMove(e.screenY)"
		v-event:mouseup.prevent.stop="e => handleEnd(e.screenY)"
		class="vcm-picker-col"
	>
		<div class="vcm-picker-col__mask" />
		<div :style="styleH" class="vcm-picker-col__indicator" />
		<div :style="[transform, transition]" class="vcm-picker-col__wrapper">
			<div
				v-for="(item, index) in dataSource"
				:key="index"
				:style="[styleH, itemStyle]"
				class="vcm-picker-col__item"
			>
				{{ typeof item === 'object' && item.label ? item.label : item }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue';
import { cloneDeep } from 'lodash';
import { TRANSFORM, TRANSFORM_KEBAB, TRANSITION } from '../../utils';
import Extends from '../../extends';

export default {
	name: 'vcm-picker-col',
	directives: {
		...Extends.directives('event')
	},
	props: {
		dataSource: {
			type: Array,
			default: () => []
		},
		itemStyle: {
			type: Object,
			default: () => {}
		},
		value: {
			type: [String, Number]
		}
	},
	setup(props, context) {
		const { emit } = context;
		
		const offsetY = ref(0);
		const itemH = ref(34);
		const scrollStart = ref(false);
		const scrollEnd = ref(true);

		const startY = ref(0);
		const startTime = ref(0);

		const maxH = computed(() => {
			return itemH.value * props.dataSource.length - itemH.value;
		});

		const styleH = computed(() => {
			return {
				height: `${itemH.value}px`,
				lineHeight: `${itemH.value}px`
			};
		});

		const transform = computed(() => {
			let index = props.dataSource.findIndex(item => item.value === props.value);
			return {
				[TRANSFORM]: `translate3d(0, ${(index * itemH.value + offsetY.value) * -1}px, 0)`
			};
		});
		// 结束时添加
		const transition = computed(() => {
			return {
				[TRANSITION]: `${TRANSFORM_KEBAB} ${scrollEnd.value ? '500' : '0'}ms ease-out`
			};
		});

		const handleStart = (y) => {
			scrollStart.value = true;
			scrollEnd.value = false;

			startY.value = y;
			startTime.value = Date.now();
		};

		const handleMove = (y) => {
			scrollStart.value && (offsetY.value = startY.value - y);
		};

		const handleEnd = (y) => {
			let index = props.dataSource.findIndex(item => item.value === props.value);

			// 计算速度
			let translateY;
			const dt = Date.now() - startTime.value;
			if (dt > 500 || dt < 50) {
				translateY = index * itemH.value + offsetY.value;
			} else {
				const dy = startY.value - y;
				const speed = dy / dt;
				translateY = index * itemH.value + speed * 500;
			}

			let target;
			// 通知上级改变
			if (translateY <= 0) {
				target = props.dataSource[0];
			} else if (translateY >= maxH.value) {
				target = props.dataSource[props.dataSource.length - 1];
			} else {
				target = props.dataSource[Math.round(translateY / itemH.value)];
			}

			emit('change', cloneDeep(target));
			scrollStart.value = false;
			scrollEnd.value = true;

			// 初始化
			startY.value = 0;
			offsetY.value = 0;
		};

		return {
			offsetY,
			itemH,
			scrollStart,
			scrollEnd,
			startY,
			startTime,
			maxH,
			styleH,
			transform,
			transition,
			handleStart,
			handleMove,
			handleEnd
		};

	}
};

</script>

<style lang='scss'>
@import '../../style/vars.scss';

@include block(vcm-picker-col) {
	position: relative;
	height: 238px;
	overflow: hidden;
	width: 100%;
	@include element(mask) {
		position: absolute;
		left: 0;
		z-index: 3;
		top: 0;
		margin: 0 auto;
		width: 100%;
		height: 100%;
		background-image: linear-gradient(180deg,
			hsla(0, 0%, 100%, 0.95),
			hsla(0, 0%, 100%, 0.6)),
			linear-gradient(0deg,
			hsla(0, 0%, 100%, 0.95),
			hsla(0, 0%, 100%, 0.6)
		);
		background-position: top, bottom;
		background-size: 100% 102px;
		background-repeat: no-repeat;
	}
	@include element(indicator) {
		position: absolute!important;
		top: 102px;
		left: 0;
		width: 100%;
		z-index: 3;
		@include commonBorder1PX(bottom, #ddd);
		@include commonBorder1PX(top, #ddd);
	}
	@include element(wrapper) {
		padding: 102px 0;
		@include element(item) {
			color: #000;
			padding: 0;
			margin: 0 10px;
			text-align: center;
			box-sizing: border-box;
			font-size: 17px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}
</style>
