<!-- 无视这个文件，基于basic-mixin自行封装 -->
<template>
	<component 
		:is="componentType"
		:tag="tag"
		:enter-active-class="`${prefix} is-in`"
		:move-class="`${prefix} is-move`"
		:leave-active-class="`${prefix} is-out`"
		:style="its.style"
		:class="its.class"
		v-bind="$attrs"
		v-on="hooks"
	>
		<slot />
	</component>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import basicMixin from './basic-mixin';
import useTransition from './use-transition';

export default defineComponent({
	name: 'vc-transition',
	mixins: [basicMixin],
	setup() {
		const { componentType, its, listeners } = useTransition();
		return {
			its,
			listeners,
			componentType
		};
	}
});

</script>
<style lang="scss">

@import '../style/vars.scss';
$block: vc-transition;

</style>