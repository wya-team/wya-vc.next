<template>
	<div style="width: 100%;">
		<vc-sort-list 
			v-model="dataSource" 
			:mask="false" 
			style="display: flex; flex-direction: row;"
		>
			<template #default="{ it }">
				<div 
					:style="{ background: `#${it.id * 3}${it.id * 3}${it.id * 3}` }"
					:mask="false"
					style="width: 100%;color: white; height: 600px"
				>
					<vc-sort-list 
						v-model="dataSourceNest[it.id]" 
						:mask="false"
						style="display: flex; flex-direction: column;"
						value-key="__id"
					>
						<template #default="row">
							<div 
								:style="{ background: `#${row.it.__id * 4}${row.it.__id * 4}${row.it.__id * 4}` }"
								style="width: 100%;color: white; height: 100px"
							>
								parent: {{ it.id }} + child: {{ row.it.__id }}
							</div>
						</template>
					</vc-sort-list>
				</div>
			</template>
		</vc-sort-list>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import { shuffle } from 'lodash';
import SortList from '../sort-list';

let count = 0;
export default defineComponent({
	name: "vc-sort-list-basic",
	components: {
		'vc-sort-list': SortList
	},
	setup() {
		const dataSource = ref(Array.from({ length: 5 }, () => ({ id: `${count++}` })));
		const dataSourceNest = ref({
			0: Array.from({ length: 5 }, () => ({ __id: `${count++}` })),
			1: Array.from({ length: 5 }, () => ({ __id: `${count++}` })),
			2: Array.from({ length: 5 }, () => ({ __id: `${count++}` })),
			3: Array.from({ length: 5 }, () => ({ __id: `${count++}` })),
			4: Array.from({ length: 5 }, () => ({ __id: `${count++}` })),
			5: Array.from({ length: 5 }, () => ({ __id: `${count++}` })),
			6: Array.from({ length: 5 }, () => ({ __id: `${count++}` })),
		});

		return {
			dataSource,
			dataSourceNest,
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
