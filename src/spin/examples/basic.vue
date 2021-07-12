<template>
	<div>
		<vc-spin :size="15" />
		<vc-spin />
		<vc-spin :size="45" />
		<br>
		<br>
		<br>
		<br>
		<br>
		<vc-spin>
			<div>
				loading....
			</div>
		</vc-spin>
		<br>
		<br>
		<br>
		<br>
		<br>
		<vc-spin>
			loading....
		</vc-spin>
	</div>
</template>
<script>
import { defineComponent } from 'vue';
import Spin from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-spin': Spin
	}
});
</script>
