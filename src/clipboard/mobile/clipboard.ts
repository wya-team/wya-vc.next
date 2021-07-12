import MToast from '../../toast/index.m';
import ClipboardMixin from '../clipboard-mixin';
import useClipboard from '../use-clipboard';

export default {
	name: "vcm-clipboard",
	mixins: [ClipboardMixin],
	setup() {
		return useClipboard((content) => MToast.info({ content }));
	}
};