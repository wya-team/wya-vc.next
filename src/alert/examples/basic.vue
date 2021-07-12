<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<h1>Basic</h1>
		<vc-alert closable title="sss">
			sss
		</vc-alert>
		<br>
		<vc-alert closable title="sss">
			<template #desc>
				<div>desc</div>
			</template>
		</vc-alert>
		<br>
		<vc-alert closable title="sss" />
	</div>
</template>
<script>
import { defineComponent } from 'vue'; 
import Alert from '..';

export default defineComponent({
	name: "vc-alert-basic",
	components: {
		'vc-alert': Alert,
	}
});
</script>
