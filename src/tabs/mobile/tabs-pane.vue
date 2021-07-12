<!-- 用于占位，默认使用一个div, 利于动画 -->
<template>
	<div :style="style" :name="currentName" class="vcm-tabs-pane">
		<slot v-if="isReady" />
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TabsPaneMixin from '../tabs-pane-mixin';
import useTabsPane from '../use-tabs-pane';

export default {
	name: 'vcm-tabs-pane',
	mixins: [TabsPaneMixin],
	setup() {
		return useTabsPane();
	}
};
</script>

<style>
.vcm-tabs-pane {
	flex-shrink: 0;
	width: 100%;
}
.vcm-tabs.is-animated .vcm-tabs-pane{
	transition: opacity .3s cubic-bezier(.35, 0, .25, 1);
	opacity: 1;
}
</style>
