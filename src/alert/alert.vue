<template>
	<vc-transtion-fade>
		<div
			v-if="isActive"
			:class="[`is-${type}`, {'has-icon': showIcon, 'has-desc': desc || $slots.desc}]"
			:style="containerStyle"
			class="vc-alert"
		>
			<vc-icon
				v-if="showIcon"
				:type="iconType"
				:style="iconStyle"
				class="vc-alert__icon"
			/>
			<div class="vc-alert__content">
				<div class="vc-alert__message">
					<div
						v-if="title"
						:style="titleStyle"
						v-html="title"
					/>
					<div v-else :style="titleStyle">
						<slot />
					</div>
					<div
						v-if="desc"
						:style="descStyle"
						v-html="desc"
					/>
					<div
						v-else-if="$slots.desc"
						:style="descStyle"
					>
						<slot name="desc" />
					</div>
				</div>
				<div v-if="closable" class="vc-alert__close" @click="handleClose">
					<slot name="close">
						<vc-icon type="close" />
					</slot>
				</div>
			</div>
		</div>
	</vc-transtion-fade>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import Icon from '../icon';
import Transition from '../transition';

// [color, borderColor, backgroundColor], -> CSS
const THEME_MAP = {
	info: ['#5495f6', '#91d5ff', '#e6f7ff'],
	success: ['#52c41a', '#b7eb8f', '#f6ffed'],
	error: ['#ed4014', '#ffb08f', '#fbe9e9'],
	warning: ['#ffbf00', '#ffe58f', '#fffbe6']
};

export default defineComponent({
	name: 'vc-alert',
	components: {
		'vc-icon': Icon,
		'vc-transtion-fade': Transition.Fade
	},
	props: {
		modelValue: {
			type: Boolean,
			default: true
		},
		type: {
			type: String as PropType<'success' | 'info' | 'error' | 'warning'>,
			default: 'info'
		},
		title: {
			type: String,
			default: ''
		},
		desc: {
			type: String,
			default: ''
		},
		icon: {
			type: String,
			default: ''
		},
		showIcon: {
			type: Boolean,
			default: true
		},
		closable: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'close', 'visible-change'],
	setup(props, context) {
		const { slots, emit } = context;
		const isActive = ref(false);

		const containerStyle = computed(() => {
			const [_color, borderColor, backgroundColor] = THEME_MAP[props.type];
			return {
				borderColor,
				backgroundColor
			};
		});

		const iconStyle = computed(() => {
			const [color] = THEME_MAP[props.type];
			return {
				color
			};
		});

		const titleStyle = computed(() => {
			const [color] = THEME_MAP[props.type];
			return (props.desc || slots.desc)
				? {
					marginBottom: '5px',
					fontSize: '14px',
					color
				}
				: {};
		});

		const descStyle = computed(() => {
			const [color] = THEME_MAP[props.type];
			return {
				color,
				opacity: '.7'
			};
		});

		const iconType = computed(() => {
			return props.icon || props.type;
		});

		const handleClose = () => {
			isActive.value = false;

			emit('close');
			emit('visible-change', false);
			emit('update:modelValue', false);
		};

		watch(
			() => props.modelValue, 
			(v) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		return {
			isActive,
			containerStyle,
			iconStyle,
			titleStyle,
			descStyle,
			iconType,
			handleClose
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';

$block: vc-alert;

@include block($block) {
	overflow: hidden;
	position: relative;
	padding: 4px 10px;
	font-size: 14px;
	border-width: 1px;
	border-style: solid;
	border-radius: 4px;
	color: #515151;
	min-height: 32px;
	@include element(icon) {
		position: absolute;
		left: 12px;
		top: 15px;
		transform: translate3d(0, -50%, 0);
		font-size: 16px;
	}
	@include when(icon, true) {
		padding-left: 38px;
	}
	@include when(desc, true) {
		padding-left: 50px;
		@include element(icon) {
			font-size: 28px;
		}
	}
	@include element(content) {
		display: flex;
	}
	@include element(message) {
		flex: 1;
		> em {
			margin: 0 3px;
			font-style: normal;
		}
	}
	@include element(close) {
		margin-left: 12px;
		cursor: pointer;
	}
	@include when(info) {
		@include element(message) {
			> em {
				color: #5495f6;
			}
		}
	}
	@include when(info) {
		@include element(message) {
			> em {
				color: #5495f6;
			}
		}
	}

	@include when(success) {
		@include element(message) {
			> em {
				color: #52c41a;
			}
		}
	}

	@include when(error) {
		@include element(message) {
			> em {
				color: #ed4014;
			}
		}
	}
	@include when(warning) {
		@include element(message) {
			> em {
				color: #faad14;
			}
		}
	}
}
</style>
