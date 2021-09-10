<template>
	<div :style="{ paddingLeft: `${indent}px`}" class="vcm-list-item" @click="handleLinkTo">
		<div :class="classes" class="vcm-list-item__wrapper">
			<div :style="[labelStyle]">
				<slot name="label">
					{{ label }}
				</slot>
			</div>
			<div class="vcm-list-item__content">
				<div class="vcm-list-item__extra">
					<slot name="extra">
						{{ extra }}
					</slot>
				</div>
				<vc-icon
					v-if="arrow"
					:type="icon"
					class="vcm-list-item__icon"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { getCurrentInstance, defineComponent, computed, inject } from 'vue'; 
import Icon from '../../icon/index';
import type { FormInject } from '../../form/types';
import type { ListInject } from '../types';

const HTTP_REGEX = /[a-zA-z]+:\/\/[^\s]*/;

export default defineComponent({
	name: 'vcm-list-item',
	components: {
		'vc-icon': Icon
	},
	props: {
		label: String,
		labelWidth: {
			type: [String, Number],
			default: ''
		},
		extra: String,
		arrow: {
			type: [String, Boolean],
			default: 'right',
		},
		// 多行
		multiple: {
			type: Boolean,
			default: false
		},
		to: [String, Object],
		method: {
			type: String,
			default: 'push',
			validator: (v: string) => /^(push|replace|go|back|forward)$/.test(v)
		},
		indent: {
			type: Number,
			default: 12
		},
		href: {
			type: Boolean,
			default: false
		}
	},
	emits: ['click'],
	setup(props, context) {
		const { emit } = context;
		const { ctx } = getCurrentInstance() as any;
		const form = inject('form', {} as FormInject);
		const list = inject('list', {} as ListInject);

		const classes = computed(() => {
			/**
			 * form/list特殊处理
			 */
			let hasForm = !!form.props;
			let hasList = !!list.props;

			return {
				'is-alone': !hasList || hasForm,
				'is-multi': props.multiple,
				'is-line': !props.multiple,
			};
		});

		const labelStyle = computed(() => {
			const labelWidth = props.labelWidth === 0 || props.labelWidth 
				? props.labelWidth 
				: list?.props?.labelWidth;

			return {
				width: labelWidth > 0 ? `${labelWidth}px` : 'auto'
			};
		});

		const icon = computed(() => {
			return typeof props.arrow === 'string' ? props.arrow : 'right';
		});


		const handleLinkTo = (e: Event) => {
			if (props.to && typeof props.to === 'string') {
				HTTP_REGEX.test(props.to)
					? window.open(props.to)
					: props.href
						? (window.location.href = props.to)
						: ctx.$router && ctx.$router[props.method](props.to);
			} else {
				emit('click', e);
			}
		};

		return {
			icon,
			classes,
			labelStyle,
			handleLinkTo
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-list-item) {
	@include element(wrapper) {
		@include commonBorder1PX(bottom);
		display: flex;
		font-size: 16px;
		line-height: 24px;
		background: #fff;
		color: #000;
		padding-top: 12px;
		padding-bottom: 12px;
		padding-right: 12px;
		// 单行
		@include when(line) {
			align-items: center;
			justify-content: space-between;
		}
		// 换行
		@include when(multi) {
			flex-direction: column;
		}
		@include when(alone) {
			@include pseudo(after) {
				display: none
			}
			padding-top: unset;
			padding-bottom: unset;
			padding-right: unset;
		}
	}

	@include element(content) {
		display: flex;
		align-items: center;
	}
	@include element(extra) {
		color: #999;
	}
	@include element(icon) {
		color: #999;
		font-size: 13px;
		margin-left: 5px;
	}
	&:last-child .vcm-list-item__wrapper:after {
		display: none
	}
}
</style>
