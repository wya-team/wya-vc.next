<template>
	<div>
		<vcm-switch v-model="single" open="开" close="关" @change="handleChange" />

		<vcm-switch :value="true" />
		<vcm-switch :value="false" />
		
		<vcm-switch>
			<template #open>
				<span>开</span>
			</template>
			<template #close>
				<span>关</span>
			</template>
		</vcm-switch>
		<br><br>
		<vcm-switch size="large">
			<template #open>
				<span>开启</span>
			</template>
			<template #close>
				<span>关闭</span>
			</template>
		</vcm-switch>
		<vcm-switch size="large">
			<template #open>
				<span>ON</span>
			</template>
			<template #close>
				<span>OFF</span>
			</template>
		</vcm-switch>

		<br>
		<br>
		<br>
		<br>
		
		<!-- 强制设置值 -->
		<vcm-switch
			:model-value="value"
			@change="handleChangeValue"
		/>
	
		<!-- loading -->
		<vcm-switch
			:v-model="value"
			@click="handleClick"
		/>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Switch from '../index.m';

export default defineComponent({
	name: "vcm-switch-basic",
	components: {
		'vcm-switch': Switch
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
