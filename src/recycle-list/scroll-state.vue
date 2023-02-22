<template>
	<template v-if="owner">
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
	</template>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import Customer from '../customer';
import Spin from '../spin';

export default defineComponent({
	components: {
		'vc-customer': Customer,
		'vc-spin': Spin
	},
	setup(props, { slots }) {
		const instance = getCurrentInstance();
		let owner = instance?.parent?.ctx;

		return {
			owner
		};
	}
});
</script>