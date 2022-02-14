import * as Vue from 'vue';
import { kebabCase, merge } from 'lodash';

// basic
import ActionSheet from './action-sheet/index';
import MActionSheet from './action-sheet/index.m';
import Alert from './alert/index';
import MAlert from './alert/index.m';
import Artboard from './artboard/index';
import MArtboard from './artboard/index.m';
import Button from './button/index';
import MButton from './button/index.m';
import Calendar from './calendar/index';
import MCalendar from './calendar/index.m';
import Card from './card/index';
import MCard from './card/index.m';
import Carousel from './carousel/index';
import MCarousel from './carousel/index.m';
import Cascader from './cascader/index';
import MCascader from './cascader/index.m';
import Checkbox from './checkbox/index';
import MCheckbox from './checkbox/index.m';
import Clipboard from './clipboard/index';
import MClipboard from './clipboard/index.m';
import Collapse from './collapse/index';
import MCollapse from './collapse/index.m';
import ColorPicker from './color-picker/index';
import MColorPicker from './color-picker/index.m';
import Countdown from './countdown/index';
import MCountdown from './countdown/index.m';
import Customer from './customer/index';
import MCustomer from './customer/index.m';
import DatePicker from './date-picker/index';
import MDatePicker from './date-picker/index.m';
import DebounceClick from './debounce-click/index';
import MDebounceClick from './debounce-click/index.m';
import Divider from './divider/index';
import MDivider from './divider/index.m';
import Drawer from './drawer/index';
import MDrawer from './drawer/index.m';
import Dropdown from './dropdown/index';
import MDropdown from './dropdown/index.m';
import Echarts from './echarts/index';
import MEcharts from './echarts/index.m';
import Editor from './editor/index';
import MEditor from './editor/index.m';
import Expand from './expand/index';
import MExpand from './expand/index.m';
import Form from './form/index';
import MForm from './form/index.m';
import Fragment from './fragment/index';
import MFragment from './fragment/index.m';
import HtmlImage from './html-image/index';
import MHtmlImage from './html-image/index.m';
import Icon from './icon/index';
import MIcon from './icon/index.m';
import Image from './image/index';
import MImage from './image/index.m';
import ImageCrop from './image-crop/index';
import MImageCrop from './image-crop/index.m';
import ImagePreview from './image-preview/index';
import MImagePreview from './image-preview/index.m';
import ImageProcessing from './image-processing/index';
import MImageProcessing from './image-processing/index.m';
import Input from './input/index';
import MInput from './input/index.m';
import List from './list/index';
import MList from './list/index.m';
import Marquee from './marquee/index';
import MMarquee from './marquee/index.m';
import Message from './message/index';
import MMessage from './message/index.m';
import Modal from './modal/index';
import MModal from './modal/index.m';
import Notice from './notice/index';
import MNotice from './notice/index.m';
import Option from './option/index';
import MOption from './option/index.m';
import Page from './page/index';
import MPage from './page/index.m';
// import Paging from './paging/index';
// import MPaging from './paging/index.m';
import Picker from './picker/index';
import MPicker from './picker/index.m';
import Popconfirm from './popconfirm/index';
import MPopconfirm from './popconfirm/index.m';
import Popover from './popover/index';
import MPopover from './popover/index.m';
import Popup from './popup/index';
import MPopup from './popup/index.m';
import Portal from './portal/index';
import MPortal from './portal/index.m';
import Print from './print/index';
import MPrint from './print/index.m';
import Progress from './progress/index';
import MProgress from './progress/index.m';
import Radio from './radio/index';
import MRadio from './radio/index.m';
import Rate from './rate/index';
import MRate from './rate/index.m';
// import RecycleList from './recycle-list/index';
// import MRecycleList from './recycle-list/index.m';
import Scroller from './scroller/index';
import MScroller from './scroller/index.m';
import Select from './select/index';
import MSelect from './select/index.m';
import Slider from './slider/index';
import MSlider from './slider/index.m';
import SortList from './sort-list/index';
import MSortList from './sort-list/index.m';
import Spin from './spin/index';
import MSpin from './spin/index.m';
import Steps from './steps/index';
import MSteps from './steps/index.m';
import Switch from './switch/index';
import MSwitch from './switch/index.m';
import Table from './table/index';
import MTable from './table/index.m';
import Tabs from './tabs/index';
import MTabs from './tabs/index.m';
import Tag from './tag/index';
import MTag from './tag/index.m';
import Text from './text/index';
import MText from './text/index.m';
import Textarea from './textarea/index';
import MTextarea from './textarea/index.m';
import Timeline from './timeline/index';
import MTimeline from './timeline/index.m';
import TimePicker from './time-picker/index';
import MTimePicker from './time-picker/index.m';
import Toast from './toast/index';
import MToast from './toast/index.m';
import Touch from './touch/index';
import MTouch from './touch/index.m';
import Transition from './transition/index';
import MTransition from './transition/index.m';
import Tree from './tree/index';
import MTree from './tree/index.m';
import Upload from './upload/index';
import MUpload from './upload/index.m';
import UploadPicker from './upload-picker/index';
import MUploadPicker from './upload-picker/index.m';

// 功能
import Vc, { VcInstance, VcError, VcBasic } from './vc/index';

import * as Utils from './utils/index';

import Extends from './extends/index';

const ButtonGroup = Button.Group;
const MButtonGroup = MButton.Group;
const CarouselItem = Carousel.Item;
const MCarouselItem = MCarousel.Item;
const MCascaderView = MCascader.View;
const CheckboxGroup = Checkbox.Group;
const MCheckboxGroup = MCheckbox.Group;
const CollapseItem = Collapse.Item;
const MCollapseItem = MCollapse.Item;
const MDatePickerView = MDatePicker.View;
const DropdownItem = Dropdown.Item;
const MDropdownItem = MDropdown.Item;
const DropdownMenu = Dropdown.Menu;
const MDropdownMenu = MDropdown.Menu;
const EditorView = Editor.View;
const MEditorView = MEditor.View;
const FormItem = Form.Item;
const MFormItem = MForm.Item;
const InputNumber = Input.Number;
const MInputNumber = MInput.Number;
const InputSearch = Input.Search;
const MInputSearch = MInput.Search;
const ListItem = List.Item;
const MListItem = MList.Item;
const PickerView = Picker.View;
const MPickerView = MPicker.View;
const PickerPopup = Picker.Popup;
const MPickerPopup = MPicker.Popup;
const RadioGroup = Radio.Group;
const MRadioGroup = MRadio.Group;
const StepsItem = Steps.Item;
const MStepsItem = MSteps.Item;
const StepsBar = Steps.Bar;
const MStepsBar = MSteps.Bar;
const TabsPane = Tabs.Pane;
const MTabsPane = MTabs.Pane;
const TimelineItem = Timeline.Item;
const MTimelineItem = MTimeline.Item;
const TransitionFade = Transition.Fade;
const MTransitionFade = MTransition.Fade;
const TransitionScale = Transition.Scale;
const MTransitionScale = MTransition.Scale;
const TransitionSlide = Transition.Slide;
const MTransitionSlide = MTransition.Slide;
const TransitionZoom = Transition.Zoom;
const MTransitionZoom = MTransition.Zoom;
const TransitionCollapse = Transition.Collapse;
const MTransitionCollapse = MTransition.Collapse;
const TreeSelect = Tree.Select;
const MTreeSelect = MTree.Select;
const version = '__VC_VERSION__';

const Components = {
	// components
	ActionSheet,
	MActionSheet,
	Alert,
	MAlert,
	Artboard,
	MArtboard,
	Button,
	MButton,
	ButtonGroup,
	MButtonGroup,
	Calendar,
	MCalendar,
	Card,
	MCard,
	Carousel,
	MCarousel,
	CarouselItem,
	MCarouselItem,
	Cascader,
	MCascader,
	MCascaderView,
	Checkbox,
	MCheckbox,
	CheckboxGroup,
	MCheckboxGroup,
	Clipboard,
	MClipboard,
	Collapse,
	MCollapse,
	CollapseItem,
	MCollapseItem,
	ColorPicker,
	MColorPicker,
	Countdown,
	MCountdown,
	Customer,
	MCustomer,
	DatePicker,
	MDatePicker,
	MDatePickerView,
	DebounceClick,
	MDebounceClick,
	Divider,
	MDivider,
	Drawer,
	MDrawer,
	Dropdown,
	MDropdown,
	DropdownItem,
	MDropdownItem,
	DropdownMenu,
	MDropdownMenu,
	Echarts,
	MEcharts,
	Editor,
	MEditor,
	EditorView,
	MEditorView,
	Expand,
	MExpand,
	// FilesPicker,
	// MFilesPicker,
	Form,
	MForm,
	FormItem,
	MFormItem,
	Fragment,
	MFragment,
	HtmlImage,
	MHtmlImage,
	Icon,
	MIcon,
	Image,
	MImage,
	ImageCrop,
	MImageCrop,
	// ImagePicker,
	// MImagePicker,
	ImagePreview,
	MImagePreview,
	ImageProcessing,
	MImageProcessing,
	Input,
	MInput,
	InputNumber,
	MInputNumber,
	InputSearch,
	MInputSearch,
	List,
	MList,
	ListItem,
	MListItem,
	Marquee,
	MMarquee,
	Modal,
	MModal,
	Notice,
	MNotice,
	Option,
	MOption,
	Page,
	MPage,
	// Paging,
	// MPaging,
	Picker,
	MPicker,
	PickerView,
	MPickerView,
	PickerPopup,
	MPickerPopup,
	Popconfirm,
	MPopconfirm,
	Popover,
	MPopover,
	Popup,
	MPopup,
	Print,
	MPrint,
	Progress,
	MProgress,
	Radio,
	MRadio,
	RadioGroup,
	MRadioGroup,
	Rate,
	MRate,
	// RecycleList,
	// MRecycleList,
	Scroller,
	MScroller,
	Select,
	MSelect,
	Slider,
	MSlider,
	SortList,
	MSortList,
	Spin,
	MSpin,
	Steps,
	MSteps,
	StepsItem,
	MStepsItem,
	StepsBar,
	MStepsBar,
	Switch,
	MSwitch,
	Table,
	MTable,
	Tabs,
	MTabs,
	TabsPane,
	MTabsPane,
	Tag,
	MTag,
	Text,
	MText,
	Textarea,
	MTextarea,
	Timeline,
	MTimeline,
	TimelineItem,
	MTimelineItem,
	TimePicker,
	MTimePicker,
	Touch,
	MTouch,
	Transition,
	MTransition,
	TransitionFade,
	MTransitionFade,
	TransitionScale,
	MTransitionScale,
	TransitionSlide,
	MTransitionSlide,
	TransitionZoom,
	MTransitionZoom,
	TransitionCollapse,
	MTransitionCollapse,
	Tree,
	MTree,
	TreeSelect,
	MTreeSelect,
	Upload,
	MUpload,
	UploadPicker,
	MUploadPicker
};

const install = (app, opts = {}) => {
	app.use(Vc, opts);
	Object.keys(Components).forEach(key => {
		let comp = kebabCase(key);
		comp = comp.startsWith('m-') ? `vc${comp}` : `vc-${comp}`;
		app.component(comp, Components[key]);
	});
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && !window.Vue) {
	window.Vue = Vue;
}

// extra
export {
	Vc,
	VcInstance,
	VcBasic,
	VcError,
	Utils,
	Extends
};

// component
export {
	ActionSheet,
	MActionSheet,
	Alert,
	MAlert,
	Artboard,
	MArtboard,
	Button,
	MButton,
	ButtonGroup,
	MButtonGroup,
	Calendar,
	MCalendar,
	Card,
	MCard,
	Carousel,
	MCarousel,
	CarouselItem,
	MCarouselItem,
	Cascader,
	MCascader,
	MCascaderView,
	Checkbox,
	MCheckbox,
	CheckboxGroup,
	MCheckboxGroup,
	Clipboard,
	MClipboard,
	Collapse,
	MCollapse,
	CollapseItem,
	MCollapseItem,
	ColorPicker,
	MColorPicker,
	Countdown,
	MCountdown,
	Customer,
	MCustomer,
	DatePicker,
	MDatePicker,
	MDatePickerView,
	DebounceClick,
	MDebounceClick,
	Divider,
	MDivider,
	Drawer,
	MDrawer,
	Dropdown,
	MDropdown,
	DropdownItem,
	MDropdownItem,
	DropdownMenu,
	MDropdownMenu,
	Echarts,
	MEcharts,
	Editor,
	MEditor,
	EditorView,
	MEditorView,
	Expand,
	MExpand,
	Form,
	MForm,
	FormItem,
	MFormItem,
	Fragment,
	MFragment,
	HtmlImage,
	MHtmlImage,
	Icon,
	MIcon,
	Image,
	MImage,
	ImageCrop,
	MImageCrop,
	ImagePreview,
	MImagePreview,
	ImageProcessing,
	MImageProcessing,
	Input,
	MInput,
	InputNumber,
	MInputNumber,
	InputSearch,
	MInputSearch,
	List,
	MList,
	ListItem,
	MListItem,
	Marquee,
	MMarquee,
	Notice,
	MNotice,
	Option,
	MOption,
	Page,
	MPage,
	// 	Paging,
	// 	MPaging,
	Picker,
	MPicker,
	PickerView,
	MPickerView,
	PickerPopup,
	MPickerPopup,
	Popconfirm,
	MPopconfirm,
	Popover,
	MPopover,
	Popup,
	MPopup,
	Print,
	MPrint,
	Progress,
	MProgress,
	Radio,
	MRadio,
	RadioGroup,
	MRadioGroup,
	Rate,
	MRate,
	// 	RecycleList,
	// 	MRecycleList,
	Scroller,
	MScroller,
	Select,
	MSelect,
	Slider,
	MSlider,
	SortList,
	MSortList,
	Spin,
	MSpin,
	Steps,
	MSteps,
	StepsItem,
	MStepsItem,
	StepsBar,
	MStepsBar,
	Switch,
	MSwitch,
	Table,
	MTable,
	Tabs,
	MTabs,
	TabsPane,
	MTabsPane,
	Tag,
	MTag,
	Text,
	MText,
	Textarea,
	MTextarea,
	Timeline,
	MTimeline,
	TimelineItem,
	MTimelineItem,
	TimePicker,
	MTimePicker,
	Touch,
	MTouch,
	Transition,
	MTransition,
	TransitionFade,
	MTransitionFade,
	TransitionScale,
	MTransitionScale,
	TransitionSlide,
	MTransitionSlide,
	TransitionZoom,
	MTransitionZoom,
	TransitionCollapse,
	MTransitionCollapse,
	Tree,
	MTree,
	TreeSelect,
	MTreeSelect,
	Upload,
	MUpload,
	UploadPicker,
	MUploadPicker,
	// 弹
	Message,
	MMessage,
	Modal,
	MModal,
	Portal,
	MPortal,
	Toast,
	MToast,

	// 用于打包映射
	version,
	install
};

export default merge(
	{ 
		version, 
		install
	},
	{
		Vc,
		VcInstance,
		VcBasic,
		VcError,
		Utils,
		Extends
	},
	{
		Message,
		MMessage,
		Modal,
		MModal,
		Portal,
		MPortal,
		Toast,
		MToast,
	},
	Components
);

