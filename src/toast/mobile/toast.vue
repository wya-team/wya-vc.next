<template>
	<div class="vcm-toast">
		<div 
			class="vcm-toast__bg" 
			@click="handleClose"
			@touchmove.prevent
		/>
		<vcm-transition-fade 
			:duration="{ enter: 0.3, leave: 0.15 }"
			@after-leave="handleRemove"
		>
			<div v-show="isVisible" class="vcm-toast__wrapper">
				<vcm-spin v-if="mode === 'loading'" class="vcm-toast__loading" />
				<p v-if="content" class="vcm-toast__content" v-html="content" />
				<vcm-customer v-else :render="content" />
			</div>
		</vcm-transition-fade>
	</div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import Customer from "../../customer/index.m";
import Spin from "../../spin/index.m";
import Transition from "../../transition/index.m";

export default {
	name: 'vcm-toast',
	components: {
		'vcm-customer': Customer,
		'vcm-transition-fade': Transition.Fade,
		'vcm-spin': Spin
	},
	props: {
		content: [String, Function],
		maskClosable: {
			type: Boolean,
			default: true
		},
		duration: {
			type: Number,
			default: 3
		},
		mode: {
			type: String,
			default: 'info',
			validator: (val) => ['info', 'loading', 'success', 'warning', 'error'].includes(val)
		},
	},

	setup(props, context) {
		const { emit } = context;
		const isVisible = ref(false);

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

		let exposes = ['destroy', 'remove', 'close', 'hide']
			.reduce((pre, key) => {
				pre[key] = handleRemove;
				return pre;
			}, {});
		
		return {
			isVisible,
			handleRemove,
			handleClose,
			...exposes
		};
	}
};
</script>

<style lang="scss">

@import '../../style/vars.scss';

@include block(vcm-toast) {
	@include element(bg) {
		position: fixed;
		// background: $mask-bg-color;
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
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 4001;
		max-width: 50%;
		height: auto;
		background: rgba(58, 58, 58, .75);
		padding: 9px 15px;
		border-radius: 3px;
		line-height: 1.5;
		color: #fff;
		text-align: center;
	}
	@include element(loading) {
		line-height: 24px;
	}
	@include element(content) {
		word-break: break-all;
	}
}
</style>