// @file 含该组件内所有类型定义
import { EditorConfig } from '../editor/types';
import { ImagePreviewConfig } from '../image-preview/types';
import { HtmlImageConfig } from '../html-image/types';
import { IconConfig } from '../icon/types';
import { PortalConfig } from '../portal/types';
import { UploadConfig } from '../upload/types';
import { RecycleListConfig } from '../recycle-list/types';
import { UploadPickerConfig, VideoPreviewConfig } from '../upload-picker/types';

/**
 * 组件的配置项
 */
export interface Config {
	Editor?: EditorConfig;

	HtmlImage?: HtmlImageConfig;

	Icon?: IconConfig;

	ImagePreview?: ImagePreviewConfig;

	Portal?: PortalConfig;

	Upload?: UploadConfig;

	UploadPicker?: UploadPickerConfig;

	VideoPreview?: VideoPreviewConfig,

	RecycleList?: RecycleListConfig
}
