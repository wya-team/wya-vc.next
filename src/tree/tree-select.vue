<template>
	<vc-popover 
		v-model="isActive"
		v-bind="attrs" 
		:arrow="arrow" 
		:trigger="trigger"
		:tag="tag"
		:placement="placement"
		:auto-width="autoWidth"
		:disabled="disabled"
		:portal-class-name="['is-padding-none', portalClassName]"
		:class="[classes, inherit.class]"
		:style="[inherit.style]"
		class="vc-tree-select"
		animation="y"
		@mouseenter="isHover = true"
		@mouseleave="isHover = false"
		@ready="$emit('ready')"
		@close="$emit('close')"
		@visible-change="$emit('visible-change', isActive)"
	>	
		<vc-input
			ref="input"
			:element-id="elementId"
			:readonly="true"
			:disabled="disabled"
			:placeholder="placeholder || '请选择'"
			:allow-dispatch="false"
			:value="currentLabel"
			class="vc-tree-select__input"
		>
			<template v-if="(currentValue && currentValue.length > 0)" #content>
				<div :class="classes" class="vc-tree-select__tags">
					<vc-tag 
						v-for="(item, index) in currentValue" 
						:key="item" 
						:closable="!disabled"
						@close="handleClose(item, index)"
					>
						{{ currentLabel[index] || extra[index] || '' }}
					</vc-tag>
				</div>
			</template>
			<template #append>
				<!-- down, up, clear -->
				<div class="vc-tree-select__append">
					<vc-icon
						:type="showClear ? 'clear' : icon"
						:class="{ 'is-arrow': !showClear }"
						class="vc-tree-select__icon"
						@click="handleClear"
					/>
				</div>
			</template>
		</vc-input>
		<template #content>
			<div class="vc-tree-select__content">
				<div v-if="searchable" class="vc-tree-select__search">
					<vc-input-search 
						v-model="searchValue" 
						:placeholder="searchPlaceholder"
						@input="handleSearch" 
					/>
				</div>
				<div v-if="isLoading" class="vc-tree-select__loading">
					<vc-spin :size="16" />
				</div>
				<div class="vc-tree-select__options">
					<!-- 暂时不支持lazy -->
					<vc-tree
						v-model="currentValue" 
						:data-source="dataSource"
						:check-strictly="checkStrictly"
						:expanded-keys="currentValue"
						:allow-dispatch="false"
						show-checkbox
						@change="handleChange"
					/>
				</div>
				<!-- hack for slot, 异步数据弹层已打开时未刷新 -->
				<span v-show="false" v-text="currentValue" />
			</div>
		</template>
	</vc-popover>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref, getCurrentInstance, inject } from 'vue';
import { pick, cloneDeep, debounce, isEqualWith } from 'lodash';
import { getSelectedData, getUid, flattenData, getLabel } from '../utils/index';
import { VcError } from '../vc/index';
import Input from '../input/index';
import Popover from '../popover/index';
import Spin from '../spin/index';
import Tag from '../tag/index';
import Icon from '../icon/index';
import InputMixin from '../input/input-mixin';
import Tree from './tree';
import { useAttrs } from '../hooks';

export default defineComponent({
	name: 'vc-tree-select',
	components: {
		'vc-input': Input,
		'vc-input-search': Input.Search,
		'vc-icon': Icon,
		'vc-popover': Popover,
		'vc-tag': Tag,
		'vc-spin': Spin,
		'vc-tree': Tree,
	},
	inheritAttrs: false,
	props: {
		...pick(Tree.props, [
			'checkStrictly',
			'dataSource'
		]),
		...pick(Popover.props, [
			'portalClassName'
		]),
		...pick(InputMixin.props, [
			'elementId', 
			'modelValue', 
			'readonly', 
			'disabled', 
			'size', 
			'placeholder',
			'clearable'
		]),
		searchPlaceholder: {
			type: String,
			default: ''
		},
		trigger: {
			type: String,
			default: 'hover'
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
		autoWidth: {
			type: Boolean,
			default: true
		},
		extra: {
			type: Array,
			default: () => ([])
		},
		max: {
			type: Number,
			default: 1,
			validator: v => v >= 1,
		},
		searchable: {
			type: Boolean,
			default: false
		},
		loadData: {
			type: Function,
		}
	},
	emits: ['update:modelValue', 'change', 'ready', 'close', 'visible-change'],
	setup(props, context) {
		const { emit } = context;
		const its = useAttrs({ standard: false });
		const instance = getCurrentInstance();
		const formItem = inject('form-item', {});
		const isHover = ref(false);
		const isActive = ref(false);
		const isLoading = ref(false);
		const searchValue = ref('');
		const searchRegex = ref(new RegExp());
		const currentValue = ref([]);
		const currentLabel = ref([]);
		const rebuildData = ref([]);

		const icon = computed(() => {
			return isActive.value ? 'up' : 'down';
		});
		const showClear = computed(() => {
			let value = currentValue.value.length > 0;
			let basic = props.clearable && !props.disabled && isHover.value;
			return value && basic;
		});
		const classes = computed(() => {
			return {
				'is-disabled': props.disabled
			};
		});
		const dataMap = computed(() => {
			return flattenData(props.dataSource, { parent: true, cascader: false });
		});

		const inherit = computed(() => {
			return {
				style: its.value.style,
				class: its.value.class,
			};
		});

		const attrs = computed(() => {
			return its.value.attrs;
		});

		const resetLabel = () => {
			/**
			 * 耗时操作
			 */
			currentLabel.value = currentValue.value.map(v => getLabel(dataMap.value, v));
		};

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			emit('change', currentValue.value);
			emit('update:modelValue', currentValue.value);

			// form表单
			formItem?.change?.(currentValue.value);
		};

		const handleClear = (e) => {
			if (!showClear.value) return;
			e.stopPropagation();
			emit('clear');

			currentValue.value = [];
			currentLabel.value = [];
			isActive.value = false;
			sync();
		};

		const handleClose = (v, index) => {
			currentValue.value.splice(index, 1);
			currentLabel.value.splice(index, 1);

			sync();
		};

		/**
		 * 默认防抖
		 */
		const _loadData = debounce(function () {
			let remote = props.loadData(searchValue.value, instance);
			
			if (remote && remote.then) {
				isLoading.value = true;
				remote.finally(() => {
					isLoading.value = false;
				});
			} else {
				throw new VcError('tree-select', 'loadData 返回值需要Promise');
			}
		}, 250, { leading: false });

		const handleSearch = (v) => {
			searchValue.value = v;
			searchRegex.value = new RegExp(v, 'i');
			props.loadData && _loadData();
		};

		const handleChange = (v, data) => {
			currentValue.value = v;
			currentLabel.value = data.checkedNodes.map(i => i.label);

			sync();
		};

		watch(
			() => props.modelValue,
			(v) => {
				if (isEqualWith(v, currentValue.value)) {
					return;
				}
				currentValue.value = v;

				resetLabel();
			},
			{ immediate: true }
		);

		watch(
			() => props.dataSource,
			(v) => {
				resetLabel();
			}
		);

		return {
			inherit,
			attrs,
			isHover,
			isActive,
			isLoading,
			searchValue,
			searchRegex,
			currentValue,
			currentLabel,
			rebuildData,
			icon,
			showClear,
			classes,
			dataMap,

			handleClose,
			handleChange,
			handleSearch,
			handleClear
		};
	}
});
</script>

<style lang='scss'>
@import '../style/vars.scss';

$block: vc-tree-select;

@include block($block) {
	display: inline-block;
	position: relative;
	width: 100%;
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
		color: #808695;
		padding: 0 10px 0 2px;
		position: relative;
		text-align: center;
		line-height: 28px;
		font-size: 12px;
		white-space: nowrap;
	}
	@include element(icon) {
		@include when(arrow) {
			transform: scale(0.8);
		}
	}
	@include element(tags) {
		padding-left: 4px;
		.vc-tag {
			margin: 3px 4px 3px 0;
		}
	}

	@include element(search) {
		padding: 12px 8px;
	}
	@include element(options) {
		max-height: 220px;
		overflow: auto;
	}
	@include element(loading) {
		text-align: center;
		padding-bottom: 8px;
	}
}

</style>
