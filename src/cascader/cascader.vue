<template>
	<vc-popover 
		v-model="isActive"
		v-bind="its.attrs" 
		:arrow="arrow" 
		:trigger="trigger"
		:tag="tag"
		:placement="placement"
		:disabled="disabled"
		:portal-class-name="['is-padding-none', portalClassName]"
		:class="its.class"
		:style="its.style"
		class="vc-cascader"
		animation="y"
		@mouseenter="isHover = true"
		@mouseleave="isHover = false"
		@ready="handleReady"
		@close="handleClose"
		@destroy="handleDestroy"
		@visible-change="$emit('visible-change', isActive)"
	>
		<slot :label="label" :value="currentValue" :active="isActive" name="default">
			<vc-input
				ref="input"
				:element-id="elementId"
				:readonly="true"
				:disabled="disabled"
				:model-value="formatLabel"
				:placeholder="placeholder || '请选择'"
				:allow-dispatch="false"
				class="vc-cascader__input"
			>
				<template #append>
					<!-- down, up, clear -->
					<div class="vc-cascader__append">
						<vc-icon
							:type="showClear ? 'clear' : icon"
							:class="{ 'is-arrow': !showClear }"
							class="vc-cascader__icon"
							@click="handleClear"
						/>
					</div>
				</template>
			</vc-input>
		</slot>
		<template #content>
			<div class="vc-cascader__content">
				<template v-for="(item, index) in cols">
					<vc-cascader-col
						v-if="rebuildData[index] && rebuildData[index].length"
						:ref="el => setColRef(el, index)"
						:key="index"
						:value="currentValue[index]"
						:index="index"
						:data-source="rebuildData[index]"
						@change="handleCellChange"
						@click="handleCellClick"
					/>
				</template>
			</div>
		</template>
	</vc-popover>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, nextTick, inject } from 'vue';
import type { PropType } from 'vue';
import { pick, isEqualWith } from 'lodash';
import { $ } from '@wya/utils';
import { getSelectedData } from '../utils/index';
import { VcError } from '../vc/index';
import Input from '../input/index';
import Popover from '../popover/index';
import Icon from '../icon/index';
import InputMixin from '../input/input-mixin';
import Col from './col.vue';
import { useAttrs } from '../hooks';

import type { TreeData, TreeValue, TreeLabel } from '../utils/types';
import type { FormItemInject } from '../form/types';
import type { CellChangeOptions } from './types';

export default defineComponent({
	name: 'vc-cascader',
	components: {
		'vc-input': Input,
		'vc-icon': Icon,
		'vc-popover': Popover,
		'vc-cascader-col': Col,
	},
	inheritAttrs: false,
	props: {
		...pick(Popover.props, [
			'portalClassName'
		]),

		...pick(InputMixin.props, [
			'elementId', 
			'readonly', 
			'disabled', 
			'modelValue', 
			'size', 
			'placeholder',
			'clearable'
		]),
		trigger: {
			type: String,
			default: 'click'
		},
		tag: {
			type: String,
			default: 'div'
		},
		placement: {
			type: String,
			default: 'bottom-left'
		},
		arrow: {
			type: Boolean,
			default: false
		},
		dataSource: {
			type: Array as PropType<TreeData[]>,
			default: () => ([] as TreeData[])
		},
		extra: {
			type: String,
			default: ''
		},
		formatter: {
			type: Function,
			default: (v: any[]) => (v && v.join(' / '))
		},
		loadData: {
			type: Function,
		},
		changeOnSelect: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'visible-change', 'ready', 'change', 'close'],
	setup(props, context) {
		const { emit } = context;
		const formItem = inject('form-item', {} as FormItemInject);
		const its = useAttrs({ standard: false });

		const isHover = ref(false);
		const isActive = ref(false);
		const currentValue = ref([] as TreeValue[]);
		const currentLabel = ref([] as TreeLabel[]);
		const rebuildData = ref([] as TreeData[]);
		const colRef = ref({});

		const icon = computed(() => {
			return isActive.value ? 'up' : 'down';
		});

		const showClear = computed(() => {
			return currentValue.value && currentValue.value.length && props.clearable && !props.disabled && isHover.value;
		});

		const cols = computed(() => {
			return currentValue.value.length + 1;
		});
		/**
		 * TODO: 初始化时，存在查找耗时
		 */
		const label = computed(() => {
			const { label: $label } = getSelectedData(
				props.changeOnSelect ? currentValue.value : props.modelValue,
				props.dataSource
			) || {};
			return ($label || []).filter(i => i);
		});

		const formatLabel = computed(() => {
			return props.formatter(label.value) || props.extra;
		});

		const setColRef = (el: HTMLElement, index: number) => {
			el && (colRef[index] = el);
		};

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = (force?: boolean) => {
			(props.changeOnSelect) && (
				emit('update:modelValue', currentValue.value, label.value),
				emit('change', currentValue.value, label.value)
			);

			// 最后一项，自动关闭
			let lastData = rebuildData.value[currentValue.value.length];

			let isLast = !lastData || lastData.length === 0;

			(isLast || props.changeOnSelect) && (isActive.value = false);

			// 该模式下，label会变为上一个值，这里重新获取一次
			if ((force || isLast) && !props.changeOnSelect) {
				const { label: $label } = getSelectedData(currentValue.value, props.dataSource) || {};

				emit('update:modelValue', currentValue.value, $label);
				emit('change', currentValue.value, $label);
			}

			formItem.change?.(currentValue.value);
		};

		/**
		 * 单列数据
		 * @param  {Array} source 数据源
		 */
		const makeData = (source: TreeData[]): TreeData[] => {
			let data = source && source.map(i => ({
				value: i.value,
				label: i.label,
				hasChildren: !!(i.children && (i.children.length > 0 || props.loadData)),
				loading: false
			}));
			return data;
		};

		/**
		 * 调整数据
		 * @return {Array} 每列的数据
		 */
		const makeRebuildData = (): TreeData[] => {
			if (!props.dataSource.length) return [] as TreeData[];
			let temp: TreeData[] = props.dataSource;
			let data = currentValue.value.slice(0).reduce((pre, cur, index) => {
				pre[index] = temp && makeData(temp);
				temp = ((temp && temp.find(i => i.value == cur)) || {}).children || [];
				return pre; 
			}, [] as TreeData[]);

			temp && data.push(makeData(temp));

			return data;
		};

		/**
		 * 初始化完成后格式化数据
		 */
		const handleReady = () => {
			rebuildData.value = makeRebuildData();

			emit('ready');

			/**
			 * 滚动到初始位置
			 * TODO: 是否移入col单独处理
			 */
			
			nextTick(() => {
				currentValue.value.forEach((item, index) => {
					let el = colRef.value[index] && colRef.value[index].$el;
					let source = rebuildData.value[index];

					if (source && el) {
						let $instance = source.findIndex((i: TreeData) => item == i.value);
						$(el.firstChild).scrollIntoView({ to: $instance * 30 });
					}
					
				});
			});
		};

		const handleClear = (e: Event) => {
			if (!showClear.value) return;
			e.stopPropagation();

			currentValue.value.splice(0, currentValue.value.length);
			isActive.value = false;
			
			sync(true);
		};

		/**
		 * 改变后的回调
		 * @param  {String} value    改变后的值
		 * @param  {Number} rowIndex 索引
		 * @param  {Number} colIndex 列
		 * @param  {Number} isHover 是否是xx
		 */
		const handleCellChange = async (options: CellChangeOptions) => {
			const { value, rowIndex, colIndex } = options || {};
			try {
				const len = currentValue.value.slice(colIndex).length;
				currentValue.value.splice(colIndex, len, value);

				/**
				 * TODO: 提前缓存index
				 */
				let children = currentValue.value.reduce((pre: TreeData[] | undefined, cur) => {
					let target = (pre && pre.find((i: TreeData) => i.value == cur)) || {};

					return target.children ? target.children : undefined;
				}, props.dataSource);

				/**
				 * 异步加载数据
				 */
				if (props.loadData && children && children.length === 0) {

					rebuildData.value[colIndex][rowIndex].loading = true;

					let res = await props.loadData();
					/**
					 * TODO: 优化，dataSource -> cloneData?
					 */
					children.splice(0, 0, ...res);
				}

				children && rebuildData.value.splice(colIndex + 1, len, makeData(children));

				// 清理
				if ((!children || children.length === 0) && colIndex < rebuildData.value.length) {
					currentValue.value.splice(colIndex + 1, len);
					rebuildData.value.splice(colIndex + 1, len);
				}
			} catch (e) {
				throw new VcError('vc-cascader', e);
			} finally {
				rebuildData.value[colIndex][rowIndex].loading && (
					rebuildData.value[colIndex][rowIndex].loading = false
				);
			}
		};

		const handleCellClick = () => {
			sync();
		};

		/**
		 * 在关闭的时候，让重新打开的值一致
		 * 暂时不用rebuildData.value, ready时会再次触发
		 */
		const handleClose = () => {
			if (!isEqualWith(currentValue.value, props.modelValue)) {
				currentValue.value = [...props.modelValue];
			}
			
			emit('close');
		};

		// 可能存在强制关闭的情况
		const handleDestroy = () => {
			isActive.value && (isActive.value = false);
		};

		watch(
			() => props.dataSource,
			() => {
				rebuildData.value = makeRebuildData();
			}
		);

		watch(
			() => props.modelValue,
			(v) => {
				/**
				 * 不使用currentValue.value = v; 避免同步修改源数据，这里有取消操作
				 * @type {[type]}
				 */
				currentValue.value = v && v.length > 0 ? [...v] : [];
			},
			{ immediate: true }
		);

		return {
			its,
			isHover,
			isActive,
			currentValue,
			currentLabel,
			rebuildData,

			icon,
			showClear,
			cols,
			label,
			formatLabel,

			setColRef,

			handleReady,
			handleClear,

			handleClose,
			handleDestroy,
			handleCellChange,
			handleCellClick,
		};
	}
});
</script>

<style lang='scss'>
@import '../style/vars.scss';

$block: vc-cascader;

@include block($block) {
	display: inline-block;
	position: relative;
	width: 100%;
	cursor: text;
	line-height: 1;
	@include element(input) {
		cursor: pointer;
		input {
			cursor: pointer;
		}
		.vc-input__append {
			z-index: 0;
		}
	}
	@include element(append) {
		cursor: pointer;
		color: #808695;
		padding: 0 10px 0 2px;
		background: white !important;
		position: relative;
		text-align: center;
		line-height: 26px;
		font-size: 12px;
		white-space: nowrap;
	}
	@include element(icon) {
		@include when(arrow) {
			transform: scale(0.7);
		}
	}
	// 默认不换行
	@include element(content) {
		display: flex;
		flex-wrap: nowrap;
	}
}

</style>
