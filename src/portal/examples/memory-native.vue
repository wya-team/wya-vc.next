<template>
	<div style="padding: 20px">
		<div id="root" />
		<h1>{{ timer ? 'Running' : '----' }}</h1>
		<button @click="start">
			Start Test
		</button>
		<br>
		<br>
		<button @click="stop">
			Stop Test
		</button>
	</div>
</template>
<script>
import { createApp, defineComponent, h, ref, onUnmounted } from "vue";

export default defineComponent(() => {
	const timer = ref(null);
	const stop = () => {
		timer.value && clearInterval(timer.value);
		timer.value = null;
	};
	const start = () => {
		stop();
		timer.value = setInterval(
			() => {
				let vm = createApp(
					() => Array
						.from({ length: 1000 })
						.map(() => h('div', { onClick: () => {} }))
				);
				vm.mount("#root");
				vm.unmount();
				vm = null;
			}, 
			10
		);
	};

	onUnmounted(stop);
	return {
		timer,
		start,
		stop
	};
});
</script>