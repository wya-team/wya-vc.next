import { pick, values } from 'lodash';
import directives from './directives';
import mixins from './mixins';

const Extends = {
	directives: (needs) => pick(directives, needs || Object.keys(directives)),
	mixins: (needs) => values(pick(mixins, needs || Object.keys(mixins))),
};

export default Extends;