<template>
	<div>
		<span @click="remove = !remove">remove: {{ remove ? 'true' : 'false' }}</span>
		<span @click="handleToggle">
			更多搜索条件{{ isVisible ? `up` : `down` }}
		</span>
		<vc-icon :type="`triangle-${isVisible ? `up2` : `down2`}`" />
		<vc-expand 
			ref="expand"
			v-model="isVisible"
			:remove="remove"
		>
			<div>
				<div>1</div>
				<div>2</div>
				<div>3</div>
				<div>4</div>
				<div>5</div>
				<div>6</div>
				<div>7</div>
				<div>8</div>
			</div>
		</vc-expand>
	</div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import Expand from '../index';
import Icon from '../../icon/index';

export default defineComponent({
	name: 'vc-expand-basic',
	components: {
		'vc-expand': Expand,
		'vc-icon': Icon,
	},
	setup() {
		const isVisible = ref(false);
		const remove = ref(false);
		return {
			isVisible,
			remove,
			handleToggle() {
				isVisible.value = !isVisible.value;
			}
		};
	}
});

</script>