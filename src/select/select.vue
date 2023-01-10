<template>
	<vc-popover 
		v-model="isActive"
		v-bind="its.attrs" 
		:arrow="arrow" 
		:trigger="trigger"
		:tag="tag"
		:placement="placement"
		:auto-width="autoWidth"
		:disabled="disabled"
		:portal-class-name="['is-padding-none', portalClassName]"
		:class="[classes, its.class]"
		:style="its.style"
		class="vc-select"
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
			:model-value="currentLabel || extra"
			:placeholder="placeholder || '请选择'"
			:allow-dispatch="false"
			class="vc-select__input"
		>
			<template v-if="multiple && (currentValue && currentValue.length > 0)" #content>
				<div :class="classes" class="vc-select__tags">
					<vc-tag 
						v-for="(item, index) in currentValue" 
						:key="item" 
						:closable="!disabled"
						@close="handleClose(item)"
					>
						{{ currentLabel[index] || '' }}
					</vc-tag>
				</div>
			</template>
			<template #append>
				<!-- down, up, clear -->
				<div class="vc-select__append">
					<vc-icon
						:type="showClear ? 'clear' : icon"
						:class="{ 'is-arrow': !showClear }"
						class="vc-select__icon"
						@click="handleClear"
					/>
				</div>
			</template>
		</vc-input>
		<template #content>
			<div class="vc-select__content">
				<div v-if="searchable" class="vc-select__search">
					<vc-input-search 
						v-model="searchValue" 
						:placeholder="searchPlaceholder"
						@input="handleSearch" 
					/>
				</div>
				<div v-if="isLoading" class="vc-select__loading">
					<vc-spin :size="16" />
				</div>
				<div class="vc-select__options">
					<div v-if="dataSource">
						<template
							v-for="(item) in data"
							:key="item.value" 	 
						>
							<vc-option-group 
								v-if="item.children && item.children.length"
								:label="item.label"
							>
								<vc-option 
									v-for="($item) in item.children"
									:key="$item.value"
									:value="$item.value"
									:label="$item.label"
									:disabled="$item.disabled"
								/>
							</vc-option-group>
							<vc-option 
								v-else
								:value="item.value"
								:label="item.label"
								:disabled="item.disabled"
							/>
						</template>
					</div>
					<slot v-else />
				</div>
			</div>
		</template>
	</vc-popover>
</template>

<script>
import { defineComponent, getCurrentInstance, provide, inject, ref, computed, watch, onMounted, onUpdated, nextTick } from 'vue';
import { pick, cloneDeep, debounce, isEqualWith } from 'lodash';
import { getSelectedData, getUid, getLabel, escapeString, flattenData } from '../utils/index';
import { VcError } from '../vc/index';
import Input from '../input/index';
import Popover from '../popover/index';
import Spin from '../spin/index';
import Tag from '../tag/index';
import Icon from '../icon/index';
import InputMixin from '../input/input-mixin';
import { useAttrs } from '../hooks';
import Option from './option.vue';
import OptionGroup from './option-group.vue';

export default {
	name: 'vc-select',
	components: {
		'vc-input': Input,
		'vc-input-search': Input.Search,
		'vc-icon': Icon,
		'vc-popover': Popover,
		'vc-tag': Tag,
		'vc-spin': Spin,
		'vc-option': Option,
		'vc-option-group': OptionGroup
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
		dataSource: {
			type: Array
		},
		searchPlaceholder: {
			type: String,
			default: ''
		},
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
		autoWidth: {
			type: Boolean,
			default: true
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
		},
		extra: {
			type: String,
			default: ''
		}
	},
	emits: ['ready', 'close', 'visible-change', 'clear', 'change', 'update:modelValue'],
	setup(props, context) {
		const { emit, slots } = context;
		const instance = getCurrentInstance();
		const its = useAttrs({ standard: false });
		const formItem = inject('form-item', {});
		const selectId = ref(getUid('select'));

		const isHover = ref(false);
		const isActive = ref(false);
		const isLoading = ref(false);
		const searchValue = ref('');
		const searchRegex = ref(new RegExp());
		const currentValue = ref(props.max > 1 ? [] : '');

		// vnode的写法性能一般, 建议直接传dataSource
		const data = computed(() => {
			if (props.dataSource) {
				return props.dataSource;
			}
			const defaults = slots?.default?.() || [];
			let vnodes = [];
			defaults.forEach((vnode) => {
				let child = [];
				if (typeof vnode.children !== 'object') return;

				if (vnode && /vcm?-select-option-group$/.test(vnode.type.name)) {
					child = vnode.children.default()[0].children;
				} else if (vnode && /vc-select-option$/.test(vnode.type.name)) {
					vnodes.push(vnode);
					return;
				} else {
					child = vnode.children;
				}

				if (child && !child.filter && child.default) {
					child = child.default();
				}

				try {
					child && vnodes.push(...child.filter(i => /option$/.test(i.type.name)));
				} catch (e) {
					throw new VcError('select', e.message);
				}
			});

			let result = [];
			vnodes.forEach((vnode) => {
				let { value, label = '', disabled } = vnode.props;

				label = String(
					label
					|| (vnode.children && vnode.children.default()[0].children) 
					|| value
				);

				result.push({
					disabled,
					value,
					label: label.trim()
				});
			});
			return result;
		});

		const source = computed(() => {
			return flattenData(data.value, { parent: true, cascader: true });
		});
		const icon = computed(() => {
			return isActive.value ? 'up' : 'down';
		});

		const multiple = computed(() => {
			return props.max > 1;
		});

		const showClear = computed(() => {
			let value = !multiple.value ? currentValue.value : currentValue.value.length > 0;
			let basic = props.clearable && !props.disabled && isHover.value;
			return (typeof value === 'number' || value) && basic;
		});
		
		const classes = computed(() => {
			return {
				'is-disabled': props.disabled
			};
		});

		const currentLabel = computed(() => {
			if (!data.value.length) {
				return multiple.value ? [] : '';
			}

			return multiple.value
				? currentValue.value.map(getLabel.bind(null, source.value))
				: getLabel(source.value, currentValue.value);
		});
		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			emit('update:modelValue', currentValue.value, currentLabel.value);
			emit('change', currentValue.value, currentLabel.value);

			// form表单
			formItem?.change?.(currentValue.value);
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
				throw new VcError('select', 'loadData 返回值需要Promise');
			}
		}, 250, { leading: false });

		const add = (v) => {
			if (!multiple.value) {
				currentValue.value = v;
				isActive.value = false;
			} else {
				currentValue.value.push(v); 
			}

			sync();
		};

		const remove = (v) => {
			let index = currentValue.value.findIndex(i => i == v);

			currentValue.value.splice(index, 1);

			sync();
		};

		const close = () => {
			isActive.value = false;
		};

		const handleClear = (e) => {
			if (!showClear.value) return;
			e.stopPropagation();

			emit('clear');

			currentValue.value = multiple.value ? [] : '';
			isActive.value = false;

			sync();
		};

		const handleClose = (v) => {
			remove(v);
		};

		const handleSearch = (v) => {
			searchValue.value = v;
			
			searchRegex.value = new RegExp(escapeString(v.trim()), 'i');
			props.loadData && _loadData();
		};

		watch(
			() => props.modelValue,
			(v) => {
				if (isEqualWith(v, currentValue.value)) {
					return;
				}

				if (multiple.value && !(v instanceof Array)) {
					if (v) {
						throw new VcError('select', `多选时初始值应该为数组，当前值是${v}`);	
					} else {
						v = [];
					}
				}

				currentValue.value = v;
			},
			{ immediate: true }
		);

		return {
			selectId,
			its,
			isHover,
			isActive,
			isLoading,
			searchValue,
			currentValue,
			currentLabel,
			icon,
			showClear,
			multiple,
			classes,
			searchRegex,

			handleClose,
			handleClear,
			handleSearch,

			add,
			remove,
			close,

			data
		};
	}
};
</script>

<style lang='scss'>
@import '../style/vars.scss';

$block: vc-select;

@include block($block) {
	display: inline-block;
	position: relative;
	width: 100%;
	line-height: 1;
	@include element(input) {
		cursor: pointer;
		background-color: #fff;
		input {
			cursor: pointer;
		}
		.vc-input__append {
			z-index: 0;
		}
		.vc-input__content {
			overflow: hidden;
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
			max-width: 100%;
			margin: 3px 4px 3px 0;
			.vc-tag__wrapper span {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			.vc-tag__close {
				margin-left: 5px;
			}
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
