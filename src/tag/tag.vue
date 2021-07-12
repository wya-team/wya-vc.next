<template>
	<div :class="classes" class="vc-tag" @click.stop="handleCheck">
		<div class="vc-tag__wrapper">
			<!-- dot -->
			<div v-if="type === 'dot'">
				<span class="vc-tag__dot" />
			</div>
			
			<!-- text -->
			<span>
				<slot />
			</span>
			<!-- icon -->
			<vc-icon 
				v-if="closable"
				type="close"
				class="vc-tag__close"
				@click="handleClose"
			/>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'; 
import Icon from '../icon/index';

export default defineComponent({
	name: "vc-tag",
	components: {
		'vc-icon': Icon
	},
	props: {
		closable: {
			type: Boolean,
			default: false
		},
		checkable: {
			type: Boolean,
			default: false
		},
		checked: {
			type: Boolean,
			default: true
		},
		color: {
			type: String,
			default: 'default',
			// validator: v => /(default|primary|success|warning|error)/.test(v),
		},
		type: {
			type: String,
			validator: v => /(default|dot|border)/.test(v),
			default: 'default'
		},
		name: {
			type: [String, Number]
		}
	},
	emits: ['close', 'change'],
	setup(props, context) {
		const { emit } = context;
		const isChecked = ref(true);
		const classes = computed(() => {
			return {
				[`is-${props.color}`]: true,
				[`is-${props.type}`]: true,
				[`is-unchecked`]: !isChecked.value
			};
		});

		const handleClose = (e) => {
			emit('close', e, props.name || undefined);
		};

		const handleCheck = () => {
			if (!props.checkable) return;

			isChecked.value = !isChecked.value;

			emit('change', isChecked.value, props.name || undefined);
		};

		watch(
			() => props.checked,
			(v) => {
				isChecked.value = !!v;
			},
			{ immediate: true }
		);

		return {
			isChecked,
			classes,
			handleClose,
			handleCheck
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-tag;

@include block($block) {
	display: inline-block;
	position: relative;
	margin: 2px 4px 2px 0;
	background: #f7f7f7;
	font-size: 12px;
	height: 22px;
	line-height: 22px;
	overflow: hidden;
	cursor: pointer;
	border-radius: 3px;
	/**
	 * 居中对齐
	 * @type {[type]}
	 */
	vertical-align: middle;
	@include commonBorder1PX();
	@include element(wrapper) {
		display: flex;
		padding: 0 8px;
		align-items: center;
	}
	@include element(close) {
		font-size: 12px;
		transform: scale(0.7);
		line-height: inherit;
	}
	@include element(dot) {
		display: flex;
		width: 10px;
		height: 10px;
		margin-right: 6px;
		border-radius: 50%;
		background: #e8eaec;
		position: relative;
	}
	
	@include when(default) {
		@include when(success) {
			color: white;
			background: $success;
			&:after, &:before {
				border-color: $success
			}
		}

		@include when(primary) {
			color: white;
			background: $primary;
			&:after, &:before {
				border-color: $primary
			}
		}

		@include when(warning) {
			color: white;
			background: $warning;
			&:after, &:before {
				border-color: $warning
			}
		}
		@include when(error) {
			color: white;
			background: $error;
			&:after, &:before {
				border-color: $error
			}
		}
	}

	@include when(border) {
		background: white;
		height: 24px;
		line-height: 24px;
		@include when(success) {
			color: $success;
			&:after, &:before {
				border-color: $success
			}
		}

		@include when(primary) {
			color: $primary;
			&:after, &:before {
				border-color: $primary
			}
		}

		@include when(warning) {
			color: $warning;
			&:after, &:before {
				border-color: $warning
			}
		}
		@include when(error) {
			color: $error;
			&:after, &:before {
				border-color: $error
			}
		}

		@include when(white) {
			color: #fff;
			&:after, &:before {
				border-color: #fff
			}
		}
		@include element(close) {
			margin-left: 18px!important;
		}
	}

	@include when(dot) {
		height: 28px;
		line-height: 28px;
		background: #fff;
		padding: 0 10px;
		@include when(success) {
			@include element(dot) {
				background: $success;
			}
		}

		@include when(primary) {
			@include element(dot) {
				background: $primary;
			}
		}

		@include when(warning) {
			@include element(dot) {
				background: $warning;
			}
		}
		@include when(error) {
			@include element(dot) {
				background: $error;
			}
		}

		@include when(white) {
			@include element(dot) {
				background: white;
			}
		}
		@include element(close) {
			margin-left: 12px;
		}
	}
	@include when(unchecked) {
		background: #fff !important;
		color: #515a6e !important;
		&:after, &:before {
			border-color: #fff !important;
		}
	}
}

</style>
