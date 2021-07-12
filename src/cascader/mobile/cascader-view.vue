<template>
	<div class="vcm-cascader-view">
		<div v-if="header">
			<div class="vcm-cascader-view__tab">
				<div 
					v-for="(item, index) in dataSource" 
					:key="item.value" 
					:class="{ 'is-active': headerIndex === index }"
					class="vcm-cascader-view__label"
					@click="handleChangeTab(index)"
				>
					{{ item.label }}
				</div>
			</div>
		</div>
		<slot :label="label" :current="currentIndex" name="header">
			<div class="vcm-cascader-view__wrapper">
				<template v-for="(item, index) in currentValue">
					<div
						v-if="(header && index > 0) || !header"
						:key="item"
						:class="{ 'is-active': currentIndex === index }"
						class="vcm-cascader-view__label"
						@click="currentIndex = index"
					>
						{{ label[index] }}
					</div>
				</template>
				<div 
					v-if="hasChildren" 
					:class="{ 'is-active': currentIndex === currentValue.length }"
					class="vcm-cascader-view__label"
					@click="currentIndex = currentValue.length"
				>
					请选择
				</div>
			</div>
		</slot>
		<vcm-cascader-col
			:value="colValue"
			:data-source="colData"
			:index="currentIndex"
			:alphabetical="alphabetical"
			:alphabet="colAlphabet"
			:alphabet-key="alphabetKey"
			@change="handleChange"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref, watch, computed, nextTick, inject } from 'vue';
import { pick, cloneDeep, isEqualWith } from 'lodash';
import { VcError } from '../../vc';
import Col from './col';
import { getSelectedData } from '../../utils/index';

export default {
	name: 'vcm-cascader-view',
	components: {
		'vcm-cascader-col': Col
	},
	props: {
		...pick(Col.props, [
			'alphabetical',
			'alphabetKey'
		]),
		modelValue: {
			type: Array,
			default: () => []
		},
		dataSource: {
			type: Array,
			default: () => ([])
		},
		loadData: Function,
		changeOnSelect: {
			type: Boolean,
			default: false
		},
		header: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'change', 'complete'],
	setup(props, context) {
		const { emit } = context;
		const currentIndex = ref(0);
		const currentValue = ref([]);
		const rebuildData = ref([]);
		const alphabetData = ref([]);
		const hasChildren = ref(true);
		const headerIndex = ref(0);

		const colValue = computed(() => {
			return currentValue.value[currentIndex.value];
		});

		const colData = computed(() => { 
			return rebuildData.value[currentIndex.value];
		});

		const colAlphabet = computed(() => {
			return alphabetData.value[currentIndex.value];
		});

		/**
		 * TODO: 初始化时，存在查找耗时
		 */
		const label = computed(() => {
			const { label: $label } = getSelectedData(currentValue.value, props.dataSource) || [];
			return ($label || []).filter(i => i);
		});

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			(props.changeOnSelect) && (
				emit('update:modelValue', currentValue.value, label.value),
				emit('change', currentValue.value, label.value)
			);

			// 最后一项，自动关闭
			let lastData = rebuildData.value[currentValue.value.length];
			let isLast = !lastData || lastData.length === 0;

			// 该模式下，label会变为上一个值，这里重新获取一次
			if (isLast && !props.changeOnSelect) {
				const { label: $label } = getSelectedData(currentValue.value, props.dataSource) || {};
				emit('update:modelValue', currentValue.value, $label);
				emit('change', currentValue.value, $label);
				emit('complete', currentValue.value, $label);
			}
		};

		/**
		 * 单列数据
		 * @param  {Array} source 数据源
		 */
		const makeData = (source) => {
			const alphabet = [];
			let data = source && source.map(it => {
				const item = {
					value: it.value,
					label: it.label,
					hasChildren: !!(it.children && (it.children.length > 0 || props.loadData)),
					loading: false,
				};
				if (props.alphabetical) {
					const letter = it[props.alphabetKey];
					item[props.alphabetKey] = letter;
					item.isFirst = !alphabet.includes(letter);
					item.isFirst && alphabet.push(letter);
				}
				return item;
			});
			return {
				data,
				alphabet
			};
		};

		/**
		 * 调整数据
		 * @return {Array} 每列的数据
		 */
		const makeRebuildData = () => {
			if (!props.dataSource.length) return [];
			let temp = props.dataSource;
			alphabetData.value = [];
			let data = currentValue.value.slice(0).reduce((pre, cur, index) => {
				const { data: $data, alphabet } = makeData(temp);
				pre[index] = $data;
				alphabetData.value[index] = alphabet;
				temp = ((temp && temp.find(i => i.value == cur)) || {}).children;
				return pre; 
			}, []);

			if (temp) {
				const result = makeData(temp);
				data.push(result.data);
				alphabetData.value.push(result.alphabet);
			}
			return data;
		};


		/**
		 * 改变后的回调
		 * @param  {String} value    改变后的值
		 * @param  {Number} rowIndex 索引
		 * @param  {Number} colIndex 列
		 * @param  {Number} isHover 是否是xx
		 */
		const handleChange = async ({ value, rowIndex, colIndex, sync: $sync }) => {
			try {
				const len = currentValue.value.slice(colIndex).length;
				currentValue.value.splice(colIndex, len, value);
				/**
				 * TODO: 提前缓存index
				 */
				let children = currentValue.value.reduce((pre, cur) => {
					let target = pre.find(i => i.value == cur) || {};

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
				
				if (children) {
					const { data, alphabet } = makeData(children);
					rebuildData.value.splice(colIndex + 1, len, data);
					alphabetData.value.splice(colIndex + 1, len, alphabet);
				}
				
				if ((!children || children.length === 0) && colIndex < rebuildData.value.length) {
					currentValue.value.splice(colIndex + 1, len);
					rebuildData.value.splice(colIndex + 1, len);

					hasChildren.value = false;
					const $currentIndex = currentValue.value.length - 1;
					
					if (props.header && $currentIndex < 1) { 
						currentIndex.value = 1;
					} else {
						currentIndex.value = $currentIndex;
					}
				} else {
					hasChildren.value = true;
					currentIndex.value = currentValue.value.length;
				}

				$sync !== false && sync();
			} catch (e) {
				throw new VcError('vc-cascader', e);
			} finally {
				rebuildData.value[colIndex][rowIndex].loading && (
					rebuildData.value[colIndex][rowIndex].loading = false
				);
			}
		};

		const handleChangeTab = (index) => {
			headerIndex.value = index;
			handleChange({ 
				value: props.dataSource[index].value,
				rowIndex: index,
				colIndex: 0,
				sync: false
			});
		};

		const resetCurrentVal = () => {
			if (props.header && props.dataSource.length) {
				if (currentValue.value.length === 0) { // 没传值，默认给第一个
					currentValue.value.push(props.dataSource[0].value);
				} else { // 传了值，判断该值在dataSource的索引修改headerIndex
					headerIndex.value = props.dataSource.findIndex(it => it.value === currentValue.value[0]);
				}
			}
		};

		/**
		 * 重置index
		 */
		const resetIndex = async () => {
			if (currentValue.value.length === 0 || rebuildData.value.length === 0) {
				currentIndex.value = 0;
				return;
			}
			// TODO: 异步场景
			// if (currentValue.value.length >= rebuildData.value.length) {
			// 	for (let i = rebuildData.value.length; i <= currentValue.value.length; i++) {
			// 		await
			// 	}
			// }
			let value = currentValue.value.slice(-1)[0];
			let colIndex = currentValue.value.length - 1;
			let rowIndex = rebuildData.value[colIndex].findIndex(i => i.value === value);

			handleChange({ value, rowIndex, colIndex, sync: false });
		};

		watch(
			() => props.dataSource,
			() => {
				rebuildData.value = makeRebuildData();
				resetCurrentVal();
				resetIndex();
			}
		);

		watch(
			() => props.modelValue,
			(v) => {
				// 数组情况下同值会重新set
				if ((v && v.length !== 0) && isEqualWith(v, currentValue.value)) {
					return;
				}

				currentValue.value = v;

				rebuildData.value = makeRebuildData();
				
				resetCurrentVal();
				resetIndex();
			},
			{ immediate: true }
		);


		return {
			currentIndex,
			currentValue,
			rebuildData,
			alphabetData,
			hasChildren,
			headerIndex,
			colValue,
			colData,
			colAlphabet,
			label,
			handleChangeTab,
			handleChange
		};
	}
};
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-cascader-view) {
	overflow: hidden;
	display: flex;
	flex-direction: column;
	flex: 1;
	font-size: 14px;
	color: #000;
	padding-top: 30px;
	@include element(tab) {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
		.vcm-cascader-view__label {
			font-size: 18px;
			padding-bottom: 5px;
		}
	}
	@include element(wrapper) {
		padding: 0 12px;
		border-bottom: 1px solid #eee;
	}
	@include element(label) {
		display: inline-block;
		padding-bottom: 12px;
		font-size: 14px;
		color: #000;
		
		&:not(:first-child) {
			margin-left: 30px;
		}
		@include when(active) {
			color: #5495f6;
			border-bottom: 2px solid #5495f6;
		}
	}
}
</style>
