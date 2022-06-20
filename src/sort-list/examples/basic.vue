<template>
	<div>
		<vc-sort-list v-model="dataSource">
			<template #default="{ it }">
				<div
					:style="{ background: `#ff33${it.id}${it.id}` }"
					style="width: 200px;line-height: 5; color: white"
				>
					{{ it.id }}
				</div>
			</template>
		</vc-sort-list>
		<button @click="handleAdd">
			添加
		</button>
		<button @click="handleDel">
			删除第一个
		</button>
		<button @click="handleShuffle">
			乱序
		</button>
	</div>
</template>
<script>
import { defineComponent, ref, watch } from 'vue';
import { shuffle } from 'lodash';
import SortList from '../sort-list';

let count = 0;
export default defineComponent({
	name: "vc-sort-list-basic",
	components: {
		'vc-sort-list': SortList
	},
	setup() {
		// const dataSource = ref(Array.from({ length: 5 }, () => ({ id: `${count++}` })));
		const dataSource = ref([]);
		return {
			dataSource,
			handleAdd() {
				dataSource.value.push({ id: `${count++}` });
			},
			handleDel() {
				dataSource.value.shift();
			},
			handleShuffle() {
				dataSource.value = shuffle(dataSource.value);
			}
		};
	}
});
</script>
