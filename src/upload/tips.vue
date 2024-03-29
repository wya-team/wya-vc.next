<template>
	<vc-transition-fade @after-leave="hide">
		<div v-if="isActive" class="vc-upload-tips">
			<div class="vc-upload-tips__header">
				<span>当前选择上传进度</span>
				<span @click="hide">&#10005;</span>
			</div>
			<div v-if="showTips" class="vc-upload-tips__result" @click="setTipsStatus">
				<span>上传结束，成功: {{ success }}，失败: {{ error }}，总数: {{ total }}</span>
				<span class="vc-upload-tips__icon">&#10005;</span>
			</div>
			<div class="vc-upload-tips__content">
				<div>文件名</div>
				<div>文件大小</div>
				<div>状态</div>
			</div>
			<ul>
				<li v-for="({ name, size, percent, msg }, key) in itemObj" :key="key">
					<div :style="{ width: `${msg ? 100 : percent}%` }" class="vc-upload-tips__bar" />
					<div class="vc-upload-tips__content">
						<div>{{ name }}</div>
						<div>{{ (size / 1024 / 1024).toFixed(2) }} MB</div>
						<div :class="msg ? `is-error` : `is-success`" class="vc-upload-tips__status">
							<span v-if="msg">{{ msg }}</span>
							<span v-else-if="!msg && (Number(percent) === 100)">&#10004;</span>
							<span v-else>上传中</span>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</vc-transition-fade>
</template>
<script lang="ts">
import { getCurrentInstance, defineComponent, ref, computed, onUnmounted } from 'vue';
import Portal from '../portal/index';
import Transition from '../transition/index';

const wrapperComponent = defineComponent({
	name: "vc-upload-tips",
	components: {
		'vc-transition-fade': Transition.Fade
	},
	setup(props, context) {
		const instance = getCurrentInstance();
		const { ctx } = instance;
		const isActive = ref(false);
		const itemArr = ref([]);
		const itemObj = ref({});
		const success = ref(0);
		const error = ref(0);
		const showTips = ref(false);
		const total = computed(() => {
			return itemArr.value.length;
		});

		let timer;

		onUnmounted(() => {
			timer && clearTimeout(timer);
		});

		/**
		 * 外部可调用
		 */
		const show = (data = {}) => {
			isActive.value = true;
			data.itemArr && (itemArr.value = [
				...itemArr.value, 
				...data.itemArr
			]);
			data.itemObj && (itemObj.value = {
				...itemObj.value,
				...data.itemObj
			});
		};

		/**
		 * 外部可调用
		 */
		const hide = () => {
			isActive.value = false;
		};

		/**
		 * 外部调用
		 */
		const setValue = (uid, key, value) => {
			switch (key) {
				case 'percent':
					// File对象实例
					itemObj.value[uid].percent = value;
					break;
				case 'success':
					success.value++;
					itemObj.value[uid].percent = 100;
					itemObj.value[uid].message = '';
					break;
				case 'error':
					error.value++;
					itemObj.value[uid].message = value;
					break;
				default:
					break;
			}

			ctx?.$forceUpdate?.();
		};
		/**
		 * 外部调用
		 */
		const setTipsStatus = (v) => {
			showTips.value = typeof v === 'boolean' ? v : !showTips.value;
		};

		return {
			total,
			isActive,
			itemArr,
			itemObj,
			success,
			error,
			showTips,
			setTipsStatus,
			setValue,
			hide,
			show
		};
	}
});
export default wrapperComponent;

export const Tips = new Portal(wrapperComponent, { 
	promise: false, 
	fragment: true 
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-upload-tips) {
	width: 600px;
	position: fixed;
	right: 5px;
	bottom: 5px;
	font-size: 13px;
	border-radius: 3px;
	box-shadow: 0 0 50px rgba(#000, 0.2);
	opacity: 1;
	background: white;
	@include element(header) {
		@include commonFlex();
		justify-content: space-between;
		align-items: center;
		padding: 10px 20px;
		flex: 1;
		border-bottom: 1px solid #e8e8e8;
		height: 50px;
	}
	ul {
		height: 300px;
		overflow: auto;
	}
	li {
		position: relative;
		height: 30px;
		border-bottom: 1px solid #e8e8e8;
	}
	@include element(bar) {
		height: 30px;
		background-color: #f5f5f5;
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
	}
	@include element(content) {
		width: 100%;
		height: 30px;
		@include commonFlex();
		div {
			padding: 0 12px;
			flex: 0 0 20%;
			height: 30px;
			line-height: 30px;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
			&:nth-child(1) {
				flex: 0 0 45%;
			}
			&:nth-child(2) {
				flex: 0 0 20%;
			}
			&:nth-child(3) {
				flex: 1;
			}
		}
	}
	@include element(result) {
		position: absolute;
		top: 50px;
		left: 0;
		padding: 0 30px 0 12px;
		width: 100%;
		height: 30px;
		line-height: 30px;
		background-color: #3abfbf;
		color: #fff;
	}
	@include element(icon) {
		position: absolute;
		top: 0;
		right: 5px;
		color: #fff;
		display: inline-block;
		width: 30px;
		height: 30px;
		text-align: center;
	}
	@include element(status) {
		@include when(success) {
			color: #5cb85c;
		}
		@include when(error) {
			color: #d9534f;
		}
	}
}

</style>