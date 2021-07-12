import Message from '../message';
import ClipboardMixin from './clipboard-mixin';
import useClipboard from './use-clipboard';

export default {
	name: "vc-clipboard",
	mixins: [ClipboardMixin],
	setup() {
		return useClipboard((content) => Message.success({ content }));
	}
};
