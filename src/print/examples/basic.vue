<template>
	<div>
		<button @click="value = `<h1>打印的内容</h1>`">
			html
		</button>
		<vc-print ref="pageTarget" :value="value">
			打印的内容
			打印的内容
			打印的内容
			打印的内容
			打印的内容
		</vc-print>
		<div @click="handleClick">
			点我打印
		</div>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Print from '../print';

export default defineComponent({
	name: "vc-print-basic",
	components: {
		'vc-print': Print
	},
	setup(props) {
		const value = ref('');
		const pageTarget = ref(null);
		return {
			value,
			pageTarget,
			handleClick() {
				pageTarget.value.print();
			}
		};
	}
});
</script>
