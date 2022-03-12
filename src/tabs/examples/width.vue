<template>
	<div style="display: flex;">
		<div>Flex下的问题</div>
		<vc-tabs>
			<vc-tabs-pane 
				v-for="item in 10" 
				:key="item" 
				:label="`标签${item}`"
				:name="item"
			>
				<div>
					<div style="width: 1160px">
						每增加一个标签，宽度增加1160px(bug);(vc-tabs-pane元素)
					</div>
				</div>
			</vc-tabs-pane>
		</vc-tabs>
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
