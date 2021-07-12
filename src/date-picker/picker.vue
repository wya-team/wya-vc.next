<template>
	<vc-popover 
		v-model="isActive"
		v-bind="its.attrs" 
		:arrow="arrow" 
		:trigger="trigger"
		:tag="tag"
		:placement="placement"
		:auto-width="false"
		:disabled="disabled"
		:portal-class-name="['is-padding-none', portalClassName]"
		:class="[classes, its.class]"
		:style="its.style"
		class="vc-picker"
		animation="y"
		@mouseenter="isHover = true"
		@mouseleave="isHover = false"
		@ready="$emit('ready')"
		@close="handleClose"
		@visible-change="$emit('visible-change', isActive)"
	>
		<slot>
			<vc-input
				ref="input"
				:element-id="elementId"
				:readonly="true"
				:disabled="disabled"
				:model-value="visibleValue"
				:placeholder="placeholder || '请选择'"
				:allow-dispatch="false"
				class="vc-picker__input"
			>
				<template #append>
					<div :class="{'is-clear': showClear}" class="vc-picker__append">
						<vc-icon
							:type="showClear ? 'clear' : icon"
							@click="handleIconClick"
						/>
					</div>
				</template>
			</vc-input>
		</slot>
		<template #content>
			<!-- 要求value 需转成Date类型，panel内流通的都是Date, panel内的数据都是数组 -->
			<component 
				:is="panel"
				:key="type"
				:value="currentValue"
				:type="type"
				:confirm="isConfirm"
				:start-date="startDate"
				:focused-date="focusedDate"
				:split-panels="splitPanels"
				:show-time="showTime"
				:format="format"
				:steps="steps"
				:multiple="multiple"
				v-bind="panelOptions" 
				@pick="handlePick"
				@clear="handleClear"
				@ok="handleOK"
			/>
		</template>
	</vc-popover>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { pick } from 'lodash';

import Input from '../input/index';
import Popover from '../popover/index';
import Spin from '../spin/index';
import Tag from '../tag/index';
import Icon from '../icon/index';
import InputMixin from '../input/input-mixin';

export default defineComponent({
	name: 'vc-picker',
	components: {
		'vc-input': Input,
		'vc-input-search': Input.Search,
		'vc-icon': Icon,
		'vc-popover': Popover,
		'vc-tag': Tag,
		'vc-spin': Spin,
	},
	inheritAttrs: false,
	props: {
		...pick(Popover.props, [
			'portalClassName'
		]),
		...pick(InputMixin.props, [
			'elementId', 
			'disabled', 
			'size', 
			'placeholder'
		]),
		clearable: {
			type: Boolean,
			default: true
		},
		modelValue: [Date, Array, String],
		multiple: Boolean,
		open: Boolean,
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
		confirm: {
			type: Boolean,
			default: false
		},
		format: String,
		separator: {
			type: String,
			default: ' - '
		},
		startDate: {
			type: Date
		},
		splitPanels: {
			type: Boolean,
			default: true
		},
		steps: {
			type: Array,
			default: () => ([])
		},
		// 选择即触发change
		changeOnSelect: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		'update:modelValue',
		'change',
		'clear',
		'error',
		'close',
		'input',
		'ready',
		'visible-change',
		'ok'
	]
});
</script>

<style lang='scss'>
@import '../style/vars.scss';

$block: vc-picker;

@include block($block) {
	display: inline-block;
	position: relative;
	width: auto;
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
		font-size: 16px;
		font-weight: 400;
		white-space: nowrap;
		cursor: default;
		@include when(clear) {
			font-size: 14px;
			cursor: pointer;
		}
		.vc-icon {
			vertical-align: unset;
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
