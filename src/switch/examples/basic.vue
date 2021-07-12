<template>
	<div>
		<vc-switch v-model="single" open="开" close="关" @change="handleChange" />

		<vc-switch :value="true" />
		<vc-switch :value="false" />
		
		<vc-switch>
			<template #open>
				<span>开</span>
			</template>
			<template #close>
				<span>关</span>
			</template>
		</vc-switch>
		<br><br>
		<vc-switch size="large">
			<template #open>
				<span>开启</span>
			</template>
			<template #close>
				<span>关闭</span>
			</template>
		</vc-switch>
		<vc-switch size="large">
			<template #open>
				<span>ON</span>
			</template>
			<template #close>
				<span>OFF</span>
			</template>
		</vc-switch>

		<br>
		<br>
		<br>
		<br>
		
		<!-- 强制设置值 -->
		<vc-switch
			:model-value="value"
			@change="handleChangeValue"
		/>
	
		<!-- loading -->
		<vc-switch
			:v-model="value"
			@click="handleClick"
		/>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Switch from '..';

export default defineComponent({
	name: "vc-switch-basic",
	components: {
		'vc-switch': Switch
	},
	setup() {
		const single = ref(false);
		const value = ref(false);

		return {
			single,
			value,
			handleChange(status) {
				console.log({
					single: single.value,
					other: arguments[0]
				});
			},

			/**
			 * 外部强制设置内部的值
			 */
			handleChangeValue(v, e, forceReset) {
				forceReset(value.value);
			},

			/**
			 * loading
			 */
			handleClick(e, forceReset) {
				return new Promise((resolve) => {
					setTimeout(resolve, 3000);
				});
			}
		};
	}
});
</script>
