<template>
	<vc-popover
		v-bind="attrs"
		:model-value="isActive"
		:placement="placement"
		:trigger="trigger"
		:portal-class-name="['is-padding-none', 'vc-popconfirm']"
		:class="inherit.class"
		:style="inherit.style"
		@ready="$emit('ready')"
		@close="$emit('close')"
		@visible-change="handleChange"
	>
		<slot />
		<template #content>
			<div 
				:style="{ width: `${width}px` }" 
				class="vc-popconfirm__wrapper"
			>
				<div class="vc-popconfirm__title">
					<slot name="icon">
						<vc-icon :type="type" :class="`is-${type}`" class="vc-popconfirm__icon" />
					</slot>
					<div>
						<slot name="title">
							<vc-customer 
								:title="title"
								:render="renderTitle"
							/>
						</slot>
					</div>
				</div>
				<div :style="contentStyle" class="vc-popconfirm__content">
					<slot name="content">
						<vc-customer 
							:content="content"
							:render="renderContent"
						/>
					</slot>
				</div>
				<div class="vc-popconfirm__footer">
					<vc-button 
						:type="cancelType" 
						style="margin-right: 8px;"
						size="small"
						@click.stop.prevent="handleCancel"
					>
						{{ cancelText }}
					</vc-button>
					<vc-button 
						:type="okType" 
						size="small"
						@click.stop.prevent="handleOk"
					>
						{{ okText }}
					</vc-button>
				</div>
			</div>
		</template>
	</vc-popover>
</template>
<script lang="tsx">
import { defineComponent, watch, computed, ref } from 'vue';
import { pick } from 'lodash';
import Popover from "../popover/index";
import Button from '../button/index';
import Icon from '../icon/index';
import Customer from '../customer/index';
import { getUid } from '../utils/index';
import { useAttrs } from '../hooks';

export default defineComponent({
	name: "vc-popconfirm",
	components: {
		'vc-popover': Popover,
		'vc-button': Button,
		'vc-icon': Icon,
		'vc-customer': Customer
	},
	inheritAttrs: false,
	props: {
		// ...pick(Popover.props, [
		// 	'animation', 
		// 	'theme', 
		// 	'content', 
		// 	'getPopupContainer', 
		// 	'portal', 
		// 	'portalStyle',
		// 	'portalClassName',
		// 	'arrow'
		// ]),
		// TODO: 直接支持title/content的Function模式，仍保留遗留API(renderTitle, renderContent)
		title: String,
		content: String,
		modelValue: {
			type: Boolean,
			default: false
		},
		placement: {
			type: String,
			default: 'top'
		},
		trigger: {
			type: String,
			default: 'click'
		},
		okText: {
			type: String,
			default: '确定'
		},
		cancelText: {
			type: String,
			default: '取消'
		},
		okType: {
			type: String,
			default: 'primary'
		},
		cancelType: {
			type: String,
			default: 'default'
		},
		type: {
			type: String,
			default: 'warning',
			validator: v => /(warning|info|success|error)/.test(v),
		},
		width: [String, Number],
		renderTitle: {
			type: Function,
			default: (props, parent) => {
				return (
					<div>{props.title}</div>
				);
			}
		},
		renderContent: {
			type: Function,
			default: (props, parent) => {
				return (
					<div>{props.content}</div>
				);
			}
		},
	},
	// inheritAttrs: false下不写ok, 因为要取ok函数
	emits: ['update:modelValue', 'visible-change', 'ready', 'close', 'cancel'],
	setup(props, context) {
		const { slots, emit, attrs: $attrs } = context;
		const its = useAttrs({ standard: false });
		const isActive = ref(false);
		const hasContentSlot = ref(!!slots.content);
		const popconfirmId = ref(getUid('popconfirm'));

		const contentStyle = computed(() => {
			return props.content || props.renderContent || hasContentSlot.value 
				? { marginBottom: '15px' }
				: {};	
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

		watch(
			() => props.modelValue,
			(v) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			emit('update:modelValue', isActive.value);
			emit('visible-change', isActive.value);
		};

		const handleOk = (e) => {
			let ok = $attrs.onOk || props.onOk || (() => {});
			let fn = ok && ok(e);

			// 2.x使用的是callback
			if (fn && fn.then) {
				return fn.then((res) => {
					isActive.value = false;
					sync();
					return res;
				});
			} else if (!fn) {
				isActive.value = false;
				sync();
			}
		};

		const handleCancel = (e) => {
			isActive.value = false;
			emit('cancel', e);

			sync();
		};

		const handleChange = (v) => {
			isActive.value = v;

			sync();
		};

		return {
			inherit,
			popconfirmId,
			attrs,
			isActive,
			hasContentSlot,
			contentStyle,
			handleOk,
			handleCancel,
			handleChange
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-popconfirm) {
	@include element(wrapper) {
		padding: 16px;
		min-width: 218px;
	}
	@include element(title) {
		padding-left: 23px;
		margin-bottom: 15px;
		position: relative;
		color: #333;
	}
	@include element(icon) {
		position: absolute;
		top: 1px;
		left: 0px;
		font-size: 15px;
		@include when(warning) {
			color: $warning;
		}
		@include when(info) {
			color: $info;
		}
		@include when(success) {
			color: $success;
		}
		@include when(error) {
			color: $error;
		}
	}
	@include element(footer) {
		text-align: right;
	}
}
</style>