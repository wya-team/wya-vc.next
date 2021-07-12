<template>
	<vc-dropdown
		v-model="isVisible"
		v-bind="$attrs"
		trigger="click"
		placement="bottom"
		tag="span"
		:portal-class-name="portalClassName"
		class="vc-table-filter"
		@visible-change="handleVisibleChange"
	>
		<vc-icon
			:type="icon || 'filter-solid'"
			:class="{'is-active': isFiltered}"
			class="vc-table-filter__icon"
		/>
		<template #list>
			<template v-if="multiple">
				<vc-dropdown-menu>
					<vc-checkbox-group 
						:model-value="currentValue" 
						class="vc-table-filter__content" 
						@change="handleChange"
					>
						<vc-checkbox
							v-for="item in dataSource"
							:key="item.value"
							:label="item.value"
							:disabled="item.disabled"
							class="vc-table-filter__item"
						>
							{{ item.label }}
						</vc-checkbox>
					</vc-checkbox-group>
				</vc-dropdown-menu>
				<div class="vc-table-filter__footer">
					<vc-button 
						class="vc-table-filter__footer--button" 
						@click="handleReset"
					>
						重置
					</vc-button>
					<vc-button
						type="primary"
						class="vc-table-filter__footer--button"
						@click="handleConfirm"
					>
						确认
					</vc-button>
				</div>
			</template>
			<div v-else class="vc-table-filter__content">
				<div 
					class="vc-table-filter__item" 
					@click="handleReset"
				>
					全部
				</div>
				<div
					v-for="item in dataSource"
					:key="item.value"
					:class="{
						'is-active': currentValue.includes(item.value),
						'is-disabled': item.disabled
					}"
					class="vc-table-filter__item"
					@click="!item.disabled && handleChange([item.value])"
				>
					{{ item.label }}
				</div>
			</div>
		</template>
	</vc-dropdown>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import Button from '../button/index';
import Dropdown from '../dropdown/index';
import Checkbox from '../checkbox/index';
import Icon from '../icon/index';

export default defineComponent({
	name: 'vc-table-filter',
	components: {
		'vc-button': Button,
		'vc-dropdown': Dropdown,
		'vc-dropdown-menu': Dropdown.Menu,
		'vc-checkbox': Checkbox,
		'vc-checkbox-group': Checkbox.Group,
		'vc-icon': Icon,
	},
	props: {
		dataSource: {
			type: Array,
			default: () => ([])
		},
		value: {
			type: Array,
			default: () => ([])
		},
		icon: String,
		// 是否多选
		multiple: {
			type: Boolean,
			default: true
		},
		portalClassName: String
	},
	emits: ['change'],
	setup(props, context) {
		const { emit } = context;
		const isVisible = ref(false);
		const currentValue = ref([]);

		const isFiltered = computed(() => {
			return currentValue.value.length > 0;
		});

		watch(
			() => props.value, 
			(v) => {
				currentValue.value = [...v];
			},
			{
				immediate: true
			}
		);

		const getHasChanged = () => {
			let hasChanged = false;
			if (props.value.length !== currentValue.value.length) {
				hasChanged = true;
			} else {
				hasChanged = props.value.some((item, index) => {
					return item !== currentValue.value[index];
				});
			}
			return hasChanged;
		};

		const handleConfirm = () => {
			getHasChanged() && emit('change', [...currentValue.value]);
			isVisible.value = false;
		};

		const handleChange = (list) => {
			currentValue.value = list;
			!props.multiple && setTimeout(handleConfirm, 100);
		};

		const handleVisibleChange = (value) => {
			if (value) {
				currentValue.value = [...props.value];
			}
		};
		
		const handleReset = () => {
			currentValue.value = [];
			getHasChanged() && emit('change', [...currentValue.value]);
			isVisible.value = false;
		};
		
		return {
			isVisible,
			isFiltered,
			currentValue,
			handleConfirm,
			handleChange,
			handleVisibleChange,
			handleReset
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-table-filter;

@include block($block) {
	padding-bottom: 0;
	display: inline-flex;
    justify-content: center;
    align-items: center;
    height: 34px;
    width: 24px;
    cursor: pointer;
	@include element(icon) {
		color: #666;
		@include when(active) {
			color: #5495f6;
		}
	}
	@include element(content) {
		max-height: 160px;
		padding: 5px 0;
		min-width: 100px;
	}
	@include element(item) {
		display: block;
		width: 100%;
		margin: 0;
		line-height: normal;
		padding: 7px 16px;
		clear: both;
		font-size: 12px !important;
		white-space: nowrap;
		list-style: none;
		cursor: pointer;
		transition: background-color .2s ease-in-out;
		@include when(active) {
			color: #5495f6;
		}
		@include when(disabled) {
			color: #999;
			cursor: not-allowed
		}
	}
	@include element(footer) {
		display: flex;
		@include modifier(button) {
			flex: 1;
			height: 32px !important;
			border-radius: 0 !important;
		}
	}
}
</style>
