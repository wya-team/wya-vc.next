<template>
	<div style="display: flex;">
		<div>Flex布局时，要增加`flex: 1; overflow-x: auto;`</div>
		<div style="flex: 1; overflow-x: auto;">
			<vc-tabs>
				<vc-tabs-pane 
					v-for="item in 10" 
					:key="item" 
					:label="`标签${item}`"
					:name="item"
				>
					<vc-table>
						<!-- any -->
					</vc-table>	
				</vc-tabs-pane>
			</vc-tabs>
		</div>
	</div>
</template>
<script lang="jsx">
import { defineComponent } from 'vue';
import Tabs from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-tabs': Tabs,
		'vc-tabs-pane': Tabs.Pane
	}
});
</script>
