<template>
	<button @click="handleClickBasic">
		BASIC: { multiple: false }
	</button>
	<br>
	<button @click="handleClickMultiple">
		BASIC: { multiple: true }
	</button>

	<vc-portal-view>
		<div>placeholder</div>
		<template #content>
			<p>{{ date }}</p>
			<p>{{ random }}</p>
		</template>
	</vc-portal-view>
	<vc-portal-view>
		<template #content>
			<p>{{ date }}</p>
			<p>{{ random }}</p>
		</template>
	</vc-portal-view>
</template>
<script>
import { defineComponent, h, ref, createApp, onUnmounted, nextTick } from "vue";
import * as _ from 'lodash';
import { Empty } from './popup/empty';
import { VcInstance } from '../../vc/index';
import Portal from '../index';

window.vc = VcInstance;

export default defineComponent({
	name: "vc-portal-basic",
	components: {
		'vc-portal-view': Portal.View
	},
	setup() {
		const date = ref();
		const random = ref();

		setInterval(() => {
			date.value = new Date();
			random.value = _.random(1, 10000);
		}, 1000);

		const handleClickBasic = async () => {
			try {
				const e = await Empty.popup({ 
					leaveDelay: 0,
					title: `Hello world - ${Math.random()}`
				});
				console.log(`${e.status}: ${e.title}`);
			} catch (e) {
				console.log(`${e.status}: ${e.title}`);
			}
		};

		const handleClickMultiple = async () => {
			try {
				const e = await Empty.popup({ 
					leaveDelay: 0,
					multiple: true,
					title: `Hello world - ${Math.random()}`
				});
				console.log(`${e.status}: ${e.title}`);
			} catch (e) {
				console.log(`${e.status}: ${e.title}`);
			}
		};

		return {
			date,
			random,
			handleClickBasic,
			handleClickMultiple
		};
	}
});
</script>
