import BasicMixin from './basic-mixin';
import Fade from './transition-fade.vue';
import Scale from './transition-scale.vue';
import Slide from './transition-slide.vue';
import Zoom from './transition-zoom.vue';
import Collapse from './transition-collapse.vue';

const Transition = {
	Fade,
	Scale,
	Slide,
	Zoom,
	Collapse,
	// mixin
	BasicMixin
};

export default Transition;
