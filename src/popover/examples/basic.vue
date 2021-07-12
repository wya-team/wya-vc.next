<template>
	<div class="vc-popover-basic">
		<div @click="isHover = !isHover">
			{{ trigger }}
		</div>
		<div @click="handleDynamic">
			无需插槽，动态创建
		</div>
		<div ref="parent" class="vc-popover-basic__container">
			<div class="vc-popover-basic__left" style="margin-top: 32px; margin-bottom: 32px">
				<vc-popover 
					:get-popup-container="getPopupContainer"
					:model-value="true" 
					:trigger="trigger"
					always
					placement="left-top"
					content="LeftTop"
					theme="dark"
					@update:modelValue="handleVisibleChange"
					@close="handleClose"
				>
					<vc-button class="g-btn g-m-tb-10">
						LT
					</vc-button>
					<template #content>
						<div style="height: 100px; width: 200px">
							动态改变内容{{ content }}
						</div>
					</template>
				</vc-popover>
				<vc-popover 
					v-model="isVisible"
					:portal="false"
					:trigger="trigger" 
					placement="left" 
					content="Left"
				>
					<vc-button class="g-btn g-m-tb-10">
						Left
					</vc-button>
					<template #content>
						<div style="height: 100px; width: 200px">
							跟随父节点
							<span @click="isVisible = false">点击我关闭弹窗</span>
						</div>
					</template>
				</vc-popover>
				<vc-popover :trigger="trigger" placement="left-bottom" content="LeftBottom">
					<vc-button class="g-btn g-m-tb-10">
						LB
					</vc-button>
					<template #content>
						<div style="height: 100px; width: 200px">
							Body
						</div>
					</template>
				</vc-popover>
			</div>
			<div class="vc-popover-basic__middle">
				<div class="g-jc-sb">
					<vc-popover 
						:get-popup-container="getPopupContainer"
						:trigger="trigger" 
						placement="top-left" 
						content="TopLeft"
						class=" g-m-lr-10"
					>
						<vc-button class="g-btn">
							TL
						</vc-button>
						<template #content>
							<div style="height: 100px; width: 200px">
								getPopupContainer
							</div>
						</template>
					</vc-popover>
					<vc-popover 
						:portal="false"
						:trigger="trigger" 
						placement="top" 
						content="Top"
						class=" g-m-lr-10"
					>
						<vc-button class="g-btn">
							Top
						</vc-button>
						<template #content>
							<div style="height: 100px; width: 200px">
								portal="false"
							</div>
						</template>
					</vc-popover>
					<vc-popover 
						:trigger="trigger" 
						placement="top-right" 
						content="TopRight"
						class=" g-m-lr-10"
					>
						<vc-button class="g-btn">
							TR
						</vc-button>
						<template #content>
							<div style="height: 100px; width: 200px">
								Body
							</div>
						</template>
					</vc-popover>
				</div>
				<div class="g-jc-sb">
					<vc-popover 
						:get-popup-container="getPopupContainer"
						:trigger="trigger" 
						placement="bottom-left"
						content="BottomLeft"
						class=" g-m-lr-10"
					>
						<vc-button class="g-btn">
							BL
						</vc-button>
						<template #content>
							<div style="height: 100px; width: 200px">
								getPopupContainer
							</div>
						</template>
					</vc-popover>
					<vc-popover 
						:portal="false"
						:trigger="trigger" 
						placement="bottom" 
						content="Bottom"
						class=" g-m-lr-10"
					>
						<vc-button class="g-btn">
							Bottom
						</vc-button>
						<template #content>
							<div style="height: 100px; width: 200px">
								portal="false"
							</div>
						</template>
					</vc-popover>
					<vc-popover 
						:trigger="trigger" 
						placement="bottom-right"
						content="BottomRight"
						class=" g-m-lr-10"
					>
						<vc-button class="g-btn">
							BR
						</vc-button>
						<template #content>
							<div style="height: 100px; width: 200px">
								Body
							</div>
						</template>
					</vc-popover>
				</div>
			</div>
			<div class="vc-popover-basic__right" style="margin-top: 32px; margin-bottom: 32px">
				<vc-popover 
					:get-popup-container="getPopupContainer"
					:trigger="trigger" 
					placement="right-top" 
					content="RightTop"
				>
					<vc-button class="g-btn g-m-tb-10">
						RT
					</vc-button>
					<template #content>
						<div style="height: 100px; width: 200px">
							getPopupContainer
						</div>
					</template>
				</vc-popover>
				<vc-popover 
					:portal="false"
					:trigger="trigger" 
					placement="right" 
					content="Right"
				>
					<vc-button class="g-btn g-m-tb-10">
						Right
					</vc-button>
					<template #content>
						<div style="height: 100px; width: 200px">
							portal="false"
						</div>
					</template>
				</vc-popover>
				<vc-popover 
					:trigger="trigger" 
					placement="right-bottom" 
					content="RightBottom"
				>
					<vc-button class="g-btn g-m-tb-10">
						RB
					</vc-button>
					<template #content>
						<div style="height: 100px; width: 200px">
							Body
						</div>
					</template>
				</vc-popover>
			</div>
		</div>
	</div>
</template>

<script lang="jsx">
import { defineComponent, ref, computed, onMounted } from 'vue';
import Popover from '..'; 
import Button from '../../button';

export default defineComponent({
	name: "vc-popover-basic",
	components: {
		"vc-popover": Popover,
		"vc-button": Button
	},
	setup() {
		const parent = ref(null);
		const content = ref(1);
		const isVisible = ref(false);
		const isHover = ref(false);
		const trigger = computed(() => {
			return isHover.value ? 'hover' : 'click';
		});
		let poper;

		onMounted(() => {
			setTimeout(() => {
				content.value = 111111;
			}, 5000);
		});

		return {
			parent,
			content,
			isVisible,
			isHover,
			trigger,
			getPopupContainer() {
				return parent.value;
			},
			handleVisibleChange(visible) {
				console.log('visible: ', visible);
			},
			handleClose() {
				console.log('close');
			},
			handleDynamic(e) {
				if (poper && poper.isActive) return;
				poper = Popover.open({
					el: document.body,
					cName: 'only',
					triggerEl: e.target,
					hover: isHover.value,
					alone: true,
					content: () => {
						return (
							<div>222</div>
						);
					}
				});
			}
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

.g-m-lr-10 {
	margin-right: 10px;
	margin-left: 10px;
}
.g-m-tb-10 {
	margin-top: 10px;
	margin-bottom: 10px;
}
.g-jc-sb {
	display: flex;
	justify-content: space-between
}
.g-btn {
	width: 80px
}

@include block(vc-popover-basic) {
	padding: 50px 0 0 0;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	background: #f2f2f2; 
	height: 3000px;
	@include element(container) {
		display: flex;
		height: 400px; 
		width: auto; 
		margin-top: 200px; 
		overflow: unset; 
		position: relative; 
		background: #666666;
		@include element(left) {
			display: flex;
			flex-direction: column;
			margin-right: 10px;
		}
		@include element(middle) {
			display: flex;
			flex-direction: column;
			justify-content: space-between
		}
		@include element(right) {
			display: flex;
			flex-direction: column;
			margin-left: 10px;
		}
	}
}
</style>

