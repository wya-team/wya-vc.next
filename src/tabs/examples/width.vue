<template>
	<div style="display: flex;">
		<div>Flex布局时，要增加`flex: 1; overflow-x: auto;`</div>
		<div style="flex: 1; overflow-x: auto;">
			<vc-tabs>
				<vc-tabs-pane 
					v-for="item in tabs" 
					:key="item" 
					:label="`标签${item}`"
					:name="item"
				>
					<div @click="handleClick">
						Tabs: {{ tabs }}
					</div>
				</vc-tabs-pane>
			</vc-tabs>
		</div>
	</div>
</template>
<script lang="jsx">
import { defineComponent, ref } from 'vue';
import Tabs from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-tabs': Tabs,
		'vc-tabs-pane': Tabs.Pane
	},
	setup() {
		const tabs = ref(10);
		return {
			tabs,
			handleClick() {
				tabs.value += 10;
			}
		};
	}
});
</script>
