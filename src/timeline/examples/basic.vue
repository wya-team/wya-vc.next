<template>
	<div style="padding: 20px">
		<vca-timeline>
			<vca-timeline-item>
				<div>
					<div>22222</div>
					<div>1111</div>
				</div>
			</vca-timeline-item>
			<vca-timeline-item>
				<div>
					<div>22222</div>
					<div>1111</div>
					<div>1111</div>
					<div>1111</div>
					<div>1111</div>
					<div>1111</div>
					<div>1111</div>
				</div>
			</vca-timeline-item>

			<vca-timeline-item>
				<template #indicator>
					<div>-</div>
				</template>
				<div>
					<div>22222</div>
					<div>1111</div>
				</div>
			</vca-timeline-item>
		</vca-timeline>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import Timeline from '..';

export default defineComponent({
	name: 'vca-basic',
	components: {
		'vca-timeline': Timeline,
		'vca-timeline-item': Timeline.Item
	},
});
</script>
