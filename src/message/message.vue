<template>
	<div class="vc-message">
		<div 
			v-if="mask"
			class="vc-message__mask"
			@click="handleClose" 
		/>
		<vc-transition-slide mode="up" @after-leave="handleRemove">
			<div 
				v-show="isVisible" 
				ref="target" 
				:style="{ top: `${top}px` }"
				class="vc-message__wrapper"
			>
				<div class="vc-message__container">
					<!-- icon -->
					<vc-spin 
						v-if="mode === 'loading'"
						:size="14"
						class="vc-message__loading" 
					/>
					<vc-icon v-else :type="mode" :class="`is-${mode}`" class="vc-message__icon" />
					<!-- content -->
					<p 
						v-if="typeof currentContent === 'string'"
						class="vc-message__content"
						v-html="currentContent"
					/>
					<vc-customer
						v-else-if="typeof currentContent === 'function'" 
						:render="currentContent" 
					/>
					<!-- close -->
					<vc-icon 
						v-if="closable" 
						type="close"
						style="font-size: 12px"
						@click="handleClose" 
					/>
				</div>
			</div>
		</vc-transition-slide>
	</div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Icon from "../icon";
import Spin from "../spin";
import Transition from '../transition';
import Customer from "../customer/index";

export default {
	name: 'vc-message',
	components: {
		'vc-icon': Icon,
		'vc-customer': Customer,
		'vc-transition-slide': Transition.Slide,
		'vc-spin': Spin,
	},
	props: {
		content: [String, Function],
		mask: {
			type: Boolean,
			default: true
		},
		maskClosable: {
			type: Boolean,
			default: true
		},
		duration: {
			type: Number,
			default: 1.5
		},
		render: {
			type: Function
		},
		top: {
			type: Number,
			default: 0,
		},
		closable: {
			type: Boolean,
			default: false,
		},
		mode: {
			type: String,
			default: 'info',
			validator: v => /(info|loading|success|error|warning)/.test(v)
		}
	},
	emits: ['portal-fulfilled', 'close'],
	setup(props, context) {
		const { emit } = context;
		const isVisible = ref(false);
		const currentContent = ref();

		// 兼容Portal设计
		const handleRemove = () => {
			emit('close');
			emit('portal-fulfilled');
		};

		const handleClose = (e) => {
			if (props.maskClosable) {
				isVisible.value = false;
			}
		};

		const setContent = (v) => {
			currentContent.value = v;
		};

		let timer;
		onMounted(() => {
			isVisible.value = true;
			if (props.duration !== 0) {
				timer = setTimeout(() => {
					// 主线程
					isVisible.value = false;
				}, props.duration * 1000 - 300); // 动画时间
			}
		});

		onUnmounted(() => {
			timer && clearTimeout(timer);
		});

		watch(() => props.content, setContent, { immediate: true });
		let exposes = ['destroy', 'remove', 'close', 'hide']
			.reduce((pre, key) => {
				pre[key] = handleRemove;
				return pre;
			}, {
				setContent
			});
		
		return {
			isVisible,
			handleRemove,
			handleClose,
			currentContent,
			...exposes
		};
	}
};
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-message) {
	@include element(mask) {
		position: fixed;
		background: $mask-bg-color;
		z-index: 3999;
		height: 100%;
		width: 100%;
		left: 0;
		right: 0;
		margin: 0 auto;
		bottom: 0;
		opacity: 0;
	}
	@include element(wrapper) {
		position: fixed;
		z-index: 4000;
		width: 100%;
		display: flex;
		justify-content: center;
	}
	@include element(container) {
		display: flex;
		align-items: center;
		padding: 8px 16px;
		background: $white;
		box-shadow: $border-shadow;
		border-radius: 4px;
		font-size: 14px;
		@include element(icon) {
			padding-right: 5px;
			@include when(success) {
				color: $success;
			}
			@include when(error) {
				color: $error;
			}
			@include when(warning) {
				color: $warning;
			}
			@include when(info) {
				color: $info;
			}
		}
	}
	@include element(loading) {
		margin-right: 5px;
	}
}

</style>