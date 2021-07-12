<template>
	<div>
		<vcm-sort-list v-model="dataSource">
			<template #default="{ it }">
				<div 
					:style="{ background: `#ff33${it.id}${it.id}` }"
					style="width: 200px;line-height: 5; color: white"
				>
					{{ it.id }}
				</div>
			</template>
		</vcm-sort-list>
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
import { defineComponent, ref } from 'vue';
import { shuffle } from 'lodash';
import MSortList from '../index.m';

let count = 0;
export default defineComponent({
	name: "vcm-sort-list-basic",
	components: {
		'vcm-sort-list': MSortList
	},
	setup() {
		const dataSource = ref(Array.from({ length: 5 }, () => ({ id: `${count++}` })));
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
