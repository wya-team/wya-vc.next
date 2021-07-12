<!-- 用于占位，默认使用一个div, 利于动画 -->
<template>
	<div :style="style" :name="currentName" class="vc-tabs-pane">
		<slot v-if="isReady" />
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TabsPaneMixin from './tabs-pane-mixin';
import useTabsPane from './use-tabs-pane';

export default defineComponent({
	name: 'vc-tabs-pane',
	mixins: [TabsPaneMixin],
	setup(props) {
		return useTabsPane();
	}
});
</script>

<style>
.vc-tabs-pane {
	flex-shrink: 0;
	width: 100%;
}
.vc-tabs.is-animated .vc-tabs-pane{
	transition: opacity .3s cubic-bezier(.35, 0, .25, 1);
	opacity: 1;
}
</style>
