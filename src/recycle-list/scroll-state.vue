<template>
	<!-- 每个状态的高度保持一致，不会造成抖动 -->
	<div v-if="owner" ref="current" class="vc-recycle-list-scroll-state">
		<div
			v-if="!owner.hasPlaceholder && !owner.isEnd"
			class="vc-recycle-list__loading"
			:style="{ visibility: owner.isLoading ? 'visible' : 'hidden' }"
		>
			<slot name="loading">
				<vc-customer 
					v-if="owner.renderer.loading"
					:render="owner.renderer.loading"
				/>
				<div v-else class="vc-recycle-list__center">
					<vc-spin :size="20" />
				</div>
			</slot>
		</div>

		<template v-if="owner.isEnd">
			<div v-if="owner.data.length" class="vc-recycle-list__finish">
				<slot name="finish">
					<vc-customer 
						v-if="owner.renderer.finish"
						:render="owner.renderer.finish"
					/>
					<div v-else class="vc-recycle-list__center">
						已全部加载
					</div>
				</slot>
			</div>

			<div 
				v-else 
				class="vc-recycle-list__empty"
			>
				<slot name="empty">
					<vc-customer 
						v-if="owner.renderer.empty"
						:render="owner.renderer.empty"
					/>
					<div v-else class="vc-recycle-list__center">
						暂无数据~
					</div>
				</slot>
			</div>
		</template>
	</div>
</template>
<script lang="ts">
import { 
	ref,
	defineComponent, 
	getCurrentInstance,
	onMounted,
	onBeforeUnmount
} from 'vue';
import Customer from '../customer';
import Spin from '../spin';
import { Resize } from '../utils/resize';

export default defineComponent({
	name: 'vc-recycle-list-scroll-state',
	components: {
		'vc-customer': Customer,
		'vc-spin': Spin
	},
	emits: ['resize'],
	setup(props, { slots, emit }) {
		const instance = getCurrentInstance();
		let owner = instance?.parent?.ctx;

		const current = ref();
		const offsetHeight = ref(0);

		const handleResize = () => {
			const v = current.value.offsetHeight;
			const changed = offsetHeight.value != v;
			if (changed) {
				offsetHeight.value = v;
				emit('resize');
			}
		}; 

		onMounted(() => {
			offsetHeight.value = current.value.offsetHeight;
			Resize.on(current.value, handleResize);
		});

		onBeforeUnmount(() => {
			Resize.off(current.value, handleResize);
		});

		return {
			owner,
			current,
			offsetHeight
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-recycle-list;

@include block($block) {
	@include element(loading) {
		padding: 10px 0;
		display: flex;
		justify-content: center;
	}
	@include element(center) {
		text-align: center;
		line-height: 20px;
	}
	@include element(finish) {
		padding: 10px 0;
	}

	@include element(empty) {
		padding: 10px 0;
	}
}
</style>
