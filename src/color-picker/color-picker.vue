<template>
	<vc-popover
		v-model="isActive"
		v-bind="its.attrs"
		:portal-class-name="['is-padding-none', portalClassName]"
		:trigger="trigger"
		:arrow="arrow"
		:disabled="disabled"
		:class="[classes, its.class]"
		:style="[its.style]"
		tag="div"
		class="vc-color-picker"
		animation="y"
		@ready="$emit('ready')"
		@close="handleRestColor"
		@visible-change="$emit('visible-change', isActive)"
	>
		<vc-input
			ref="input"
			:class="{ 'is-focus': isActive }"
			class="vc-color-picker__box"
		>
			<template #content>
				<div>
					<input :model-value="modelValue" type="hidden">
					<div class="vc-color-picker__input">
						<div class="vc-color-picker__color">
							<div v-show="modelValue === ''">
								<vc-icon type="close" />
							</div>
							<div v-show="modelValue" :style="{ backgroundColor: displayedColorStyle }" />
						</div>
					</div>
				</div>
			</template>
			<template #append>
				<div class="vc-color-picker__append">
					<vc-icon :type="icon" />
				</div>
			</template>
		</vc-input>
		<template #content>
			<div class="vc-color-picker__picker">
				<div class="vc-color-picker__wrapper">
					<vc-color-picker-view 
						:value="currentColor"
						:colors="colors"
						:hue="hue"
						:alpha="alpha"
						:recommend="recommend"
						:format="format"
						@change="handleColorChange"
					/>
				</div>
				<div class="vc-color-picker__confirm">
					<span class="vc-color-picker__value">
						<template v-if="editable">
							<vc-input
								v-model="customColor"
								@blur="handleConfirm"
								@enter="handleConfirm"
							/>
						</template>
						<template v-else>{{ currentColor }}</template>
					</span>
					<vc-button size="small" class="vc-btn is-default" @click="handleClearValue">
						清空
					</vc-button>
					<vc-button type="primary" class="vc-btn" size="small" @click="handleConfirmValue">
						确定
					</vc-button>
				</div>
			</div>
		</template>
	</vc-popover>
</template>
<script lang="ts">
import { defineComponent, watch, inject, ref, onUnmounted, onMounted, computed, getCurrentInstance, reactive } from 'vue';
import { pick, omit } from "lodash";
import { COLORS } from './constants';
import { VcError } from '../vc/index';
import Color from "./color";
// components
import PickerView from './picker-view';
import Popover from "../popover/index";
import Icon from "../icon/index";
import Input from "../input/index";
import Button from "../button/index";
import { useAttrs } from '../hooks';

const getColorRgb = (color, alpha) => {
	if (!(color instanceof Color)) {
		throw new VcError('color-picker', 'color should be instance of Color Class');
	}
	
	const { r, g, b } = color.toRgb();

	return alpha 
		? `rgba(${r}, ${g}, ${b}, ${color.get('alpha') / 100})`
		: `rgb(${r}, ${g}, ${b})`;
};
export default {
	name: 'vc-color-picker',
	components: {
		'vc-popover': Popover,
		'vc-icon': Icon,
		'vc-input': Input,
		'vc-button': Button,
		'vc-color-picker-view': PickerView
	},
	inheritAttrs: false,
	props: {
		...pick(Popover.props, [
			'portalClassName'
		]),
		...omit(PickerView.props, ['value']),
		modelValue: {
			type: String,
			default: ''
		},
		disabled: {
			type: Boolean,
			default: false
		},
		trigger: {
			type: String,
			default: 'click'
		},
		arrow: {
			type: Boolean,
			default: false
		},
		size: {
			type: String,
			default: 'default',
			validator: v => /(large|small|default)/.test(v)
		},
		editable: {
			type: Boolean,
			default: true
		},
	},
	emits: [
		'update:modelValue',
		'change',
		'ready',
		'visible-change',
		'color-change'
	],
	setup(props, { emit }) {
		const formItem = inject('form-item', {});
		const its = useAttrs();
		const isActive = ref(false);
		const customColor = ref('');
		const recommendColors = ref([...COLORS]);
		const currentColor = ref('');
		const displayedColorStyle = ref('');

		const classes = computed(() => {
			return {
				[`is-${props.size}`]: true,
				'is-disabled': props.disabled
			};
		});
		
		const icon = computed(() => {
			return isActive.value ? 'up' : 'down';
		});
		watch(
			() => props.modelValue,
			(v) => {
				currentColor.value = v;
				if (!v) {
					displayedColorStyle.value = "transparent";
				} else {
					displayedColorStyle.value = v;
				}
			},
			{ immediate: true }
		);

		watch(
			() => currentColor.value,
			(v) => {
				customColor.value = v;
				isActive.value && emit('color-change', v);
			},
			{ immediate: true }
		);

		const sync = (value) => {
			emit('update:modelValue', value);
			emit('change', value);
			formItem.change?.(value);
			isActive.value = false;
		};

		const handleColorChange = (color) => {
			customColor.value = color.value;
			displayedColorStyle.value = getColorRgb(color, props.alpha);
		};

		const handleRestColor = () => {
			currentColor.value = props.modelValue || '';
			displayedColorStyle.value = props.modelValue || '';
		};
		const handleConfirm = () => {
			currentColor.value = customColor.value;
		};

		const handleClearValue = () => {
			sync('');
		};

		const handleConfirmValue = () => {
			sync(displayedColorStyle.value);
		};

		return {
			its,
			isActive,
			customColor,
			recommendColors,
			classes,
			currentColor,
			displayedColorStyle,
			icon,
			handleColorChange,
			handleRestColor,
			sync,
			handleClearValue,
			handleConfirm,
			handleConfirmValue
		};
		
	}
};
</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-color-picker;

@include block($block) {
	display: inline-block;
	.vc-input {
		min-height: 24px;
	}
	.vc-input__append {
		height: 24px;
		line-height: 24px;
	}
	@include element(box) {
		display: inline-block;
		width: 100%;
		position: relative;
		vertical-align: middle;
		line-height: 0;
		cursor: pointer;
		&:hover {
			@include element(input) {
				border-color: #57a3f3;
			}
		}
	}
	@include when(disabled) {
		background-color: #f3f3f3;
		opacity: 1;
		cursor: not-allowed;
		color: #ccc;
		&:hover {
			@include element(input) {
				border-color: #e3e5e8;
			}
		}
	}
	@include element(append) {
		color: #808695;
		padding: 0 10px 0 2px;
		position: relative;
		text-align: center;
		line-height: 24px;
		font-size: 12px;
		white-space: nowrap;
	}
	@include element(input) {
		display: inline-block;
		width: 100%;
		height: 32px;
		line-height: 1.5;
		padding: 7px 6px 6px 7px;
		font-size: 14px;
		border-radius: 4px;
		color: #515a6e;
		background-image: none;
		position: relative;
		transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
	}
	@include when(large) {
		@include element(color) {
			width: 20px;
			height: 20px;
		}
		// TODO: 支持Input size, remove;
		@include element(input) {
			font-size: 16px;
			padding: 10px 6px 6px 7px;
			height: 40px;
		}
		@include element(icon) {
			font-size: 12px;
			height: 40px;
			line-height: 40px;
		}
	}
	@include when(small) {
		@include element(color) {
			width: 14px;
			height: 14px;
		}
		// TODO: 支持Input size, remove;
		@include element(input) {
			height: 24px;
			padding: 5px 6px 4px 7px;
		}
		@include element(icon) {
			font-size: 10px;
			height: 24px;
			line-height: 24px;
		}
	}
	@include element(color) {
		width: 18px;
		height: 18px;
		border-radius: 2px;
		div {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
			border-radius: 2px;
		}
		.vc-icon {
			font-size: 10px;
			color: #999;
			transform: scale(.6);
		}
	}
	@include element(wrapper) {
		padding: 8px 8px 0;
		width: 256px;
	}
	@include element(confirm) {
		margin-top: 8px;
		border-top: 1px solid #e8eaec;
		text-align: right;
		padding: 8px;
		clear: both;
		.vc-btn {
			height: 24px;
			padding: 0 9px;
			line-height: 1.5;
		}
		.is-default {
			margin-right: 2px;
		}
	}
	@include element(value) {
		float: left;
		width: 138px;
		height: 24px;
		line-height: 24px;
		font-size: 14px;
		text-align: left;
		.vc-input {
			min-height: 24px;
			height: 24px;
			input {
				padding: 4px 7px;
			}
		}
	}
}

</style>