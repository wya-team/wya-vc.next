<template>
	<form :autocomplete="autocomplete" class="vc-form">
		<slot />
	</form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import basicFormMixin from './form-mixin';
import useForm from './use-form';

export default defineComponent({
	name: 'vc-form',
	mixins: [basicFormMixin],
	setup() {
		return useForm();
	}
});
</script>