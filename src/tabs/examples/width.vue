<template>
	<div style="display: flex;">
		<div>Flex</div>
		<vc-tabs v-model="type">
			<vc-tabs-pane 
				v-for="item in tabs" 
				:key="item" 
				:label="`标签${item}`"
				:name="item"
			>
				<div style="width: 100%">
					<div style="width: 1160px">
						切换之后高度变换为2230（bug）
					</div>
				</div>
			</vc-tabs-pane>
		</vc-tabs>
	</div>
</template>
<script lang="jsx">
import { defineComponent, ref } from 'vue';
import { random } from 'lodash';
import Tabs from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-tabs': Tabs,
		'vc-tabs-pane': Tabs.Pane
	},
	setup(props) {
		const type = ref(3);
		const tabs = ref(10);
	
		return {
			type,
			tabs,
		};
	}
});
</script>
