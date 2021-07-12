<template>
	<div :class="classes">	
		<div
			ref="slider"
			:class="{'is-clickable': clickable}"
			class="vc-slider__wrapper"
			@click.self="handleSliderClick"
		>
			<template v-if="showStops">
				<div
					v-for="item in stops"
					:key="item"
					:style="{ 'left': item + '%' }"
					class="vc-slider__stop"
					@click.self="handleSliderClick"
				/>
			</template>
			<div
				:style="barStyle"
				class="vc-slider__bar"
				@click.self="handleSliderClick"
			/>
			<div
				:style="{left: minPosition + '%'}"
				class="vc-slider__btn-wrapper"
				@touchstart="handlePointerDown($event, 'min')"
				@mousedown="handlePointerDown($event, 'min')"
			>
				<vc-popover
					ref="minTooltip"
					:model-value="minVisible && !!formatter(exportValue[0])"
					:always="showTip === 'always'"
					:portal="false"
					trigger="focus"
					placement="top"
					theme="dark"
					tag="div"
				>
					<div
						ref="minPoint"
						:class="minButtonClasses"
						tabindex="0"
						@focus="handleFocus($event, 'min')"
						@blur="handleBlur($event, 'min')"
						@mouseenter="handleEnter($event, 'min')"
						@mouseleave="handleLeave($event, 'min')"
					/>
					<template #content>
						{{ formatter(exportValue[0]) }}
					</template>
				</vc-popover>
			</div>
			<div
				v-if="range"
				:style="{left: maxPosition + '%'}"
				class="vc-slider__btn-wrapper"
				@touchstart="handlePointerDown($event, 'max')"
				@mousedown="handlePointerDown($event, 'max')"
			>
				<vc-popover
					ref="maxTooltip"
					:model-value="maxVisible && !!formatter(exportValue[1])"
					:always="showTip === 'always'"
					:portal="false"
					trigger="focus"
					placement="top"
					theme="dark"
					tag="div"
				>
					<div
						ref="maxPoint"
						:class="maxButtonClasses"
						tabindex="0"
						@focus="handleFocus($event, 'max')"
						@blur="handleBlur($event, 'max')"
						@mouseenter="handleEnter($event, 'max')"
						@mouseleave="handleLeave($event, 'max')"
					/>
					<template #content>
						{{ formatter(exportValue[1]) }}
					</template>
				</vc-popover>
			</div>
		</div>
		<vc-input-number
			v-if="!range && showInput"
			:min="min"
			:max="max"
			:step="step"
			:model-value="String(exportValue[0])"
			:disabled="disabled"
			@input="handleInputChange" 
		/>
	</div>
</template>
<script lang="ts">
import { inject, getCurrentInstance, defineComponent, ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { pick } from 'lodash';
import InputNumber from '../input/input-number';
import Popover from '../popover/index';
import { Resize } from '../utils/index';
import { checkLimits, getPointerX, getOffset } from './utils';

export default {
	name: 'vc-slider',
	components: {
		'vc-input-number': InputNumber,
		'vc-popover': Popover
	},
	props: {
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 100
		},
		step: {
			type: Number,
			default: 1
		},
		range: {
			type: Boolean,
			default: false
		},
		modelValue: {
			type: [Number, Array],
			default: 0
		},
		disabled: {
			type: Boolean,
			default: false
		},
		// 是否可以通过点击来移动点
		clickable: {
			type: Boolean,
			default: true
		},
		showStops: {
			type: Boolean,
			default: false
		},
		formatter: {
			type: Function,
			default(val) {
				return `${val}`;
			}
		},
		showInput: Boolean,
		showTip: {
			type: String,
			default: 'hover',
			validator: (value) => /^(hover|always|never)$/.test(value)
		},
	},
	setup(props, context) {
		const { emit } = context;
		const formItem = inject('form-item', {});
		const slider = ref(null);
		const currentValue = ref([]);
		const dragging = ref(false);
		const pointerDown = ref('');
		const startX = ref(0);
		const currentX = ref(0);
		const startPos = ref(0);
		const sliderWidth = ref(0);
		const minVisible = ref(props.showTip === 'always');
		const maxVisible = ref(props.showTip === 'always');
		const minPoint = ref(null);
		const maxPoint = ref(null);

		const classes = computed(() => {
			return [
				'vc-slider',
				{

					'is-slider-input': props.showInput && !props.range,
					'is-slider-disabled': props.disabled
				}
			];
		});

		const valueRange = computed(() => {
			return props.max - props.min;
		});

		const minButtonClasses = computed(() => {
			return [
				'vc-slider__button',
				{ 'is-dragging': pointerDown.value === 'min' }
			];
		});

		const maxButtonClasses = computed(() => {
			return [
				'vc-slider__button',
				{ 'is-dragging': pointerDown.value === 'max' }
			];
		});

		const exportValue = computed(() => {
			const decimalCases = (String(props.step).split('.')[1] || '').length;
			return currentValue.value.map(value => Number(value.toFixed(decimalCases)));
		});

		const minPosition = computed(() => {
			return ((currentValue.value[0] - props.min) / valueRange.value) * 100;
		});

		const maxPosition = computed(() => {
			return ((currentValue.value[1] - props.min) / valueRange.value) * 100;
		});

		const barStyle = computed(() => {
			const style = {
				width: ((currentValue.value[0] - props.min) / valueRange.value) * 100 + '%'
			};
			if (props.range) {
				style.left = ((currentValue.value[0] - props.min) / valueRange.value) * 100 + '%';
				style.width = ((currentValue.value[1] - currentValue.value[0]) / valueRange.value) * 100 + '%';
			}
			return style;
		});

		// 分割点的left 百分比
		const stops = computed(() => {
			let stopCount = valueRange.value / props.step;
			let result = [];
			let stepWidth = (props.step / valueRange.value) * 100;
			for (let i = 1; i < stopCount; i++) {
				result.push(i * stepWidth);
			}
			return result;
		});

		const firstPosition = computed(() => {
			return currentValue.value[0];
		});

		const secondPosition = computed(() => {
			return currentValue.value[1];
		});

		const getVisibleRef = () => {
			if (pointerDown.value == 'min') {
				return minVisible;
			} else {
				return maxVisible;
			}
		};

		const getPointRef = () => {
			if (pointerDown.value == 'min') {
				return minPoint;
			} else {
				return maxPoint;
			}
		};

		const getPositionRef = () => {
			if (pointerDown.value == 'min') {
				return minPosition;
			} else {
				return maxPosition;
			}
		};

		const reset = (value) => {
			value = checkLimits(value, pick(props, ['min', 'max']));
			currentValue.value = value;
		};

		const sync = (type) => {
			const value = props.range ? exportValue.value : exportValue.value[0];
			emit(type, value, reset);

			if (type === 'change') {
				emit('update:modelValue', value, reset);
			}

			formItem[type === 'after-change' ? 'blur' : 'change']?.(value);
		};


		const changeButtonPosition = (newPos, forceType) => {
			const type = forceType || pointerDown.value;
			const index = type === 'min' ? 0 : 1;
			if (type === 'min') {
				newPos = checkLimits([newPos, props.max], pick(props, ['min', 'max']))[0];
			} else {
				newPos = checkLimits([props.min, newPos], pick(props, ['min', 'max']))[1];
			}
			const offset = getOffset(newPos, props.step);
			const value = currentValue.value;
			value[index] = newPos - offset;
			// 判断左右是否相等，否则会出现左边大于右边的情况
			if (props.range) {
				if (type === 'min' && value[0] > value[1]) value[1] = value[0];
				if (type === 'max' && value[0] > value[1]) value[0] = value[1];
			}

			reset([...value]);
			sync('change');
		};

		// handle
		const handleInputChange = (value) => {
			let minValue = Number(value || props.min);
			value = value === 0 ? 0 : minValue > props.max ? props.max : minValue;
			currentValue.value = [value, currentValue.value[1]];
		};

		const handleSliderClick = (event) => {
			if (props.disabled || !props.clickable) return;
			const $currentX = getPointerX(event);
			const sliderOffsetLeft = slider.value.getBoundingClientRect().left;
			let newPos = ((($currentX - sliderOffsetLeft) / sliderWidth.value) * valueRange.value) + props.min;
			let regularNewPos = (newPos / valueRange.value) * 100;
			if (!props.range || regularNewPos <= minPosition.value) {
				changeButtonPosition(newPos, 'min');
			} else if (regularNewPos >= maxPosition.value) {
				changeButtonPosition(newPos, 'max');
			} else {
				let type = ((newPos - firstPosition.value) <= (secondPosition.value - newPos)) ? 'min' : 'max';
				changeButtonPosition(newPos, type);
			}
		};

		const handlePointerDragStart = (e) => {
			dragging.value = false;
			startX.value = getPointerX(e);
			startPos.value = ((getPositionRef().value * valueRange.value) / 100) + props.min;
		};

		const handlePointerDrag = (e) => {
			dragging.value = true;
			currentX.value = getPointerX(e);
			const diff = ((currentX.value - startX.value) / sliderWidth.value) * valueRange.value;

			changeButtonPosition(startPos.value + diff);
		};

		const handlePointerDragEnd = () => {
			if (dragging.value) {
				dragging.value = false;
				getVisibleRef().value = false;
				getPointRef().value.blur();
				sync('after-change');
			}
			pointerDown.value = '';

			window.removeEventListener('mousemove', handlePointerDrag);
			window.removeEventListener('touchmove', handlePointerDrag);
			window.removeEventListener('mouseup', handlePointerDragEnd);
			window.removeEventListener('touchend', handlePointerDragEnd);
		};

		const handlePointerDown = (e, type) => {
			if (props.disabled) return;
			// e.preventDefault();
			pointerDown.value = type;
			handlePointerDragStart(e);

			window.addEventListener('mousemove', handlePointerDrag);
			window.addEventListener('touchmove', handlePointerDrag);
			window.addEventListener('mouseup', handlePointerDragEnd);
			window.addEventListener('touchend', handlePointerDragEnd);
		};

		const handleFocus = (event, type) => {
			getVisibleRef().value = props.showTip !== 'never';
		};

		const handleBlur = (event, type) => {
			getVisibleRef().value = props.showTip === 'never';
		};

		const handleEnter = (event, type) => {
			if (!pointerDown.value) {
				handleFocus();
			}
		};

		const handleLeave = (event, type) => {
			if (!pointerDown.value) {
				handleBlur();
			}
		};

		const handleSetSliderWidth = () => {
			sliderWidth.value = slider.value && slider.value.getBoundingClientRect().width;
		};

		watch(
			() => props.modelValue,
			(v) => {
				v = checkLimits(v, pick(props, ['min', 'max']));
				if ((v[0] !== currentValue.value[0] || v[1] !== currentValue.value[1])) {
					currentValue.value = v;
				}
			},
			{ immediate: true }
		);

		onMounted(() => {
			Resize.on(slider.value, handleSetSliderWidth);
		});

		onBeforeUnmount(() => {
			Resize.off(slider.value, handleSetSliderWidth);
		});

		return {
			slider,
			minPoint,
			maxPoint,

			currentValue,
			dragging,
			pointerDown,
			startX,
			currentX,
			startPos,
			sliderWidth,
			minVisible,
			maxVisible,
			classes,
			valueRange,
			minButtonClasses,
			maxButtonClasses,
			exportValue,
			minPosition,
			maxPosition,
			barStyle,
			stops,
			firstPosition,
			secondPosition,

			handleLeave,
			handleFocus,
			handleBlur,
			handleEnter,
			handlePointerDown,
			handleInputChange,
			handleSliderClick
		};
	}
};
</script>
<style lang="scss">
@import '../style/vars.scss';

$block: vc-slider;
@include block($block) {
	position: relative;
	z-index: 1;
	line-height: normal;
	@include element(wrapper) {
		width: 100%;
		height: 4px;
		margin: 16px 0;
		background-color: #e8eaec;
		border-radius: 3px;
		vertical-align: middle;
		position: relative;
		@include when(clickable) {
			cursor: pointer;
		}
	}
	@include element(bar) {
		height: 4px;
		background: #57a3f3;
		border-radius: 3px;
		position: absolute;
	}
	@include element(btn-wrapper) {
		width: 12px;
		height: 12px;
		text-align: center;
		background-color: transparent;
		position: absolute;
		top: -4px;
		transform: translateX(-50%);
	}
	@include element(button) {
		width: 12px;
		height: 12px;
		border: 2px solid #57a3f3;
		border-radius: 50%;
		background-color: #fff;
		transition: all .2s linear;
		outline: 0;
		&:hover {
			border-color: #2d8cf0;
			transform: scale(1.5);
			cursor: grab;
		}
		@include when(dragging) {
			border-color: #2d8cf0;
			transform: scale(1.5);
			cursor: grab;
			&:hover {
				cursor: grabbing;
			}
		}
	}
	@include element(stop) {
		position: absolute;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background-color: #ccc;
		-webkit-transform: translateX(-50%);
		transform: translateX(-50%);
	}
	@include when(slider-disabled) {
		cursor: not-allowed;
		.vc-slider__wrapper {
			background-color: #ccc;
			cursor: not-allowed;
		}
		.vc-slider__bar {
			background-color: #ccc;
		}

		.vc-slider__button {
			border-color: #ccc;
			&:hover {
				border-color: #ccc;
				cursor: not-allowed;
			}
		}
	}
	@include when(slider-input) {
		position: relative;
		.vc-slider__wrapper {
			width: auto;
			margin-right: 100px;
		}
		.vc-input-number {
			position: absolute;
			top: -12px;
			right: 0;
			width: 80px;
		}
	}
}
</style>