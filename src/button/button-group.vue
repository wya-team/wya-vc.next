<template>
	<div :class="classes" class="vc-button-group">
		<slot />
	</div>
</template>
<script lang="ts">
import { defineComponent, computed, provide } from 'vue';

export default defineComponent({
	name: "vc-button-group",
	props: {
		vertical: {
			type: Boolean,
			default: false
		},
		circle: {
			type: Boolean,
			default: false
		},
		size: {
			type: String,
			default: 'medium'
		}
	},
	setup(props) {
		provide('button-group', props);

		const classes = computed(() => (
			[
				{
					'is-vertical': props.vertical,
					'is-circle': props.circle,
					[`is-${props.size}`]: !!props.size
				}
			]
		));

		return {
			classes
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-button-group) {
	display: inline-block;
	@include block(vc-button) {
		position: relative;
		display: block;
		float: left;
		margin-left: -1px;
		border-radius: 0;
		&:first-child {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
		}
		&:last-child {
			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;
		}
		&:hover {
			z-index: 2;
		}
	}
	@include when(large) {
		@include block(vc-button) {
			padding: 8px 16px;
			font-size: 14px;
			&:first-child {
				border-top-left-radius: 4px;
				border-top-right-radius: 0;
				border-bottom-left-radius: 4px;
				border-bottom-right-radius: 0;
			}
			&:last-child {
				border-top-left-radius: 0;
				border-top-right-radius: 4px;
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 4px;
			}
		}
	}
	@include when(small) {
		@include block(vc-button) {
			padding: 3px 8px;
			font-size: 12px;
			&:first-child {
				border-top-left-radius: 3px;
				border-top-right-radius: 0;
				border-bottom-left-radius: 3px;
				border-bottom-right-radius: 0;
			}
			&:last-child {
				border-top-left-radius: 0;
				border-top-right-radius: 3px;
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 3px;
			}
		}
	}
	@include when(vertical) {
		@include block(vc-button) {
			float: none;
			margin-left: 0;
			margin-top: -1px;
			&:first-child {
				border-top-left-radius: 4px;
				border-top-right-radius: 4px;
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
			}
			&:last-child {
				border-top-left-radius: 0;
				border-top-right-radius: 0; 
				border-bottom-left-radius: 4px;
				border-bottom-right-radius: 4px;
			}
		}
		@include when(circle) {
			@include block(vc-button) {
				&:first-child {
					border-top-left-radius: 36px;
					border-top-right-radius: 36px; 
					border-bottom-left-radius: 0;
					border-bottom-right-radius: 0; 
				}
				&:last-child {
					border-top-left-radius: 0;
					border-top-right-radius: 0; 
					border-bottom-left-radius: 36px;
					border-bottom-right-radius: 36px; 
				}
			}
			@include when(large) {
				@include block(vc-button) {
					&:first-child {
						border-top-left-radius: 36px;
						border-top-right-radius: 36px; 
						border-bottom-left-radius: 0;
						border-bottom-right-radius: 0; 
					}
					&:last-child {
						border-top-left-radius: 0;
						border-top-right-radius: 0; 
						border-bottom-left-radius: 36px;
						border-bottom-right-radius: 36px; 
					}
				}
			}
			@include when(small) {
				@include block(vc-button) {
					&:first-child {
						border-top-left-radius: 24px;
						border-top-right-radius: 24px; 
						border-bottom-left-radius: 0;
						border-bottom-right-radius: 0; 
					}
					&:last-child {
						border-top-left-radius: 0;
						border-top-right-radius: 0; 
						border-bottom-left-radius: 24px;
						border-bottom-right-radius: 24px; 
					}
				}
			}
		}
	}
	@include when(circle) {
		@include block(vc-button) {
			&:first-child {
				border-top-left-radius: 32px;
				border-top-right-radius: 0; 
				border-bottom-left-radius: 32px;
				border-bottom-right-radius: 0; 
			}
			&:last-child {
				border-top-left-radius: 0px;
				border-top-right-radius: 32px;
				border-bottom-left-radius: 0px;
				border-bottom-right-radius: 32px;
			}
		}
		@include when(large) {
			@include block(vc-button) {
				&:first-child {
					border-top-left-radius: 36px;
					border-top-right-radius: 0; 
					border-bottom-left-radius: 36px;
					border-bottom-right-radius: 0; 
				}
				&:last-child {
					border-top-left-radius: 0px;
					border-top-right-radius: 36px;
					border-bottom-left-radius: 0px;
					border-bottom-right-radius: 36px;
				}
			}
		}
		@include when(small) {
			@include block(vc-button) {
				&:first-child {
					border-top-left-radius: 24px;
					border-top-right-radius: 0; 
					border-bottom-left-radius: 24px;
					border-bottom-right-radius: 0; 
				}
				&:last-child {
					border-top-left-radius: 0px;
					border-top-right-radius: 24px;
					border-bottom-left-radius: 0px;
					border-bottom-right-radius: 24px;
				}
			}
		}
	}
}
</style>