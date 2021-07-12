<template>
	<ul class="vc-rate" @mouseleave="handleMouseleave">
		<li 
			v-for="(item, index) in dataSource"
			:key="index"
			:class="{'is-not-last': index < count - 1, 'is-disabled': disabled, 'is-half': item.isHalf, 'is-select': item.isSelect }"
			:style="{...iconStyle, 'color': item.color }" 
			class="vc-rate__star"
			@click="handleClick($event, item)"
			@mousemove="handleMouseMove($event, item)"
		>
			<div class="vc-rate__star--icon vc-rate__star--first">
				<span v-if="character">{{ character }}</span>
				<vc-icon v-else :type="icon" />
			</div>
			<div class="vc-rate__star--icon vc-rate__star--second">
				<span v-if="character">{{ character }}</span>
				<vc-icon v-else :type="icon" />
			</div>
		</li>
		<li v-if="tooltips.length" class="vc-rate__tips">
			<slot name="tip" :value="currentValue">
				{{ tooltips[Math.ceil(currentValue) - 1] }}
			</slot>
		</li>
	</ul>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, inject } from 'vue';
import { DOM } from '@wya/utils';
import { eleInRegExp } from '../utils/index';
import Icon from '../icon/index';

export default defineComponent({
	name: 'vc-rate',
	components: {
		'vc-icon': Icon
	},
	props: {
		value: {
			type: Number,
			default: 0
		},
		// 星星的数量
		count: {
			type: Number,
			default: 5
		},
		color: { 
			type: String,
			default: '#16a3ff'
		},
		icon: {
			type: String,
			default: 'star'
		},
		// 自定义的字符串
		character: String,
		half: {
			type: Boolean,
			default: false
		},
		clearable: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		// 每项的提示
		tooltips: {
			type: Array,
			default: () => ([])
		},
		iconStyle: {
			type: Object,
			default: () => ({})
		},
	},
	emits: ['update:modelValue', 'change'],
	setup(props, { emit }) {
		const formItem = inject('form-item', {});
		const currentValue = ref(0);
		const hoverValue = ref(-1);
		const isHover = ref(false);
		const dataSource = ref([]);

		const config = computed(() => {
			return {
				count: props.count, 
				value: isHover.value ? hoverValue.value : currentValue.value
			};
		});

		watch(
			() => props.modelValue,
			(v) => {
				currentValue.value = props.half ? v : parseInt(v, 10);
			},
			{ immediate: true }
		);

		watch(
			() => config.value,
			(obj) => {
				let { count, value } = obj;
				let array = [...Array(count).keys()].map((v) => v + 1);
				dataSource.value = array.map((v, index) => {
					// 0 < xx < 1 0.8也算一半
					let isHalf = props.half && v > value && (v - 1) < value;
					let isFull = v === value;
					let isSelect = v <= value;
					return {
						value: v,
						isSelect,
						isFull,
						isHalf,
						color: isSelect || isHalf ? props.color : ''
					};
				});
			},
			{ immediate: true }
		);

		const getClickSide = (e) => {
			let path = e.path || DOM.composedPath(e) || [];
			let isLeftSide = path.some(item => eleInRegExp(item, { className: /vc-rate__star--first/ }));
			let isRightSide = path.some(item => eleInRegExp(item, { className: /vc-rate__star--second/ }));
			if (isLeftSide) return 'left';
			if (isRightSide) return 'right';
			return false;
		};

		const getValue = (e, $currentValue, item, clearable) => {
			let { value, isHalf, isFull } = item;
			let clickSide = props.half && getClickSide(e);
			if (!clearable) {
				if (clickSide === 'left') {
					return value - 0.5;
				} else if (clickSide === 'right') {
					return value;
				} else { // half为false
					return value;
				}
			} else if (clearable) {
				if (clickSide === 'left') {
					let offset = 0.5;
					if (isHalf) return 0;
					else if (isFull) offset = 0.5;
					return value - offset;
				} else if (clickSide === 'right') {
					if (isFull) return 0;
					return value;
				} else { // half为false
					return $currentValue == value ? 0 : value;
				}
			}
		};

		const handleMouseMove = (e, item) => {
			if (props.disabled) return;

			hoverValue.value = getValue(e, hoverValue.value, item, false);
			isHover.value = true;
		};

		const handleMouseleave = () => {
			if (props.disabled) return;
			isHover.value = false;
			hoverValue.value = -1;
		};

		const handleClick = (e, item) => {
			if (props.disabled) return;

			isHover.value = false;
			item.isHalf = props.half && item.value > currentValue.value && (item.value - 1) < currentValue.value;
			item.isFull = currentValue.value == item.value;

			currentValue.value = getValue(e, currentValue.value, item, props.clearable);
			emit('update:modelValue', currentValue.value);
			emit('change', currentValue.value);
			formItem.change?.(currentValue.value);
		};

		return {
			currentValue,
			hoverValue,
			isHover,
			dataSource,
			config,
			handleClick,
			handleMouseleave,
			handleMouseMove,
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-rate) {
	display: inline-block;
	font-size: 16px;
    line-height: unset;
    list-style: none;
	@include element(star) {
		position: relative;
		display: inline-block;
		cursor: pointer;
		@include when(not-last) {
			margin-right: 8px;
		}
		@include when(half) {
			.vc-rate__star--first {
				opacity: 1;
			}
		}
		@include when(select) {
			.vc-rate__star--icon {
				color: inherit;
			}
		}
		@include when(disabled) {
			cursor: unset;
		}
		@include modifier(icon) {
			color: #f0f0f0;
			transition: all .3s;
			user-select: none;
		}
		@include modifier(first) {
			color: inherit;
			position: absolute;
			top: 0;
			left: 0;
			width: 50%;
			height: 100%;
			overflow: hidden;
			opacity: 0;
		}
		@include modifier(second) {
			
		}
	}
	@include element(tips) {
		font-size: 14px;
		margin: 0 8px;
		display: inline-block;
		color: #333333;
		box-sizing: border-box;
	}
}
</style>