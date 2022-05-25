import { h, defineComponent, watch, ref, computed, onUnmounted } from 'vue';
import { Load } from '@wya/utils';
import { cloneDeep } from 'lodash';
import { getUid } from '../utils/utils';
import { insertFontStyle, insertLineHeightStyle, insertLetterSpacingStyle } from './utils';
import { lineHeight, letterSpacing } from './constant';
import defaultOptions from './default-options';

const toolMap = {
	size: ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '50px'],
	header: [1, 2, 3, 4, 5, 6, 'selected'],
	// selected 有无好像没有影响
	color: [
		"selected", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", 
		"#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", 
		"#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", 
		"#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", 
		"#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", 
		"#663d00", "#666600", "#003700", "#002966", "#3d1466"
	],
	background: [
		"#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", 
		"#9933ff", "selected", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", 
		"#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", 
		"#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", 
		"#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", 
		"#663d00", "#666600", "#003700", "#002966", "#3d1466"
	],
	font: ['selected', 'serif', 'monospace'],
	align: ['selected', 'center', 'right', 'justify'],
	lineHeight,
	letterSpacing
};

export default defineComponent({
	name: 'vc-editor-toolbar',
	props: {
		toolbar: {
			type: [Array, Object, String],
			default: '#toolbar'
		},
		uid: {
			type: String,
			default: 'toolbar'
		},
		initFontSize: Function
	},
	setup(props) {
		const buttons = computed(() => {
			let array = defaultOptions.modules.toolbar;
			if (props.toolbar instanceof Array) {
				array = props.toolbar;
			} else if (typeof props.toolbar === 'object' && props.toolbar.container instanceof Array) {
				array = props.toolbar.container;
			}

			try {
				let v = cloneDeep(array);
				return v.map(i => {
					if (typeof i[0] === 'object' && i[0].lineHeight) {
						i[0].lineHeight = i[0].lineHeight.map(j => j * 10);
					}
					return i;
				});
			} catch (e) {
				console.log(e);
			}
			return array;
		});

		const styleId = getUid('editor-toolbar-style');
		const lineHeightStyleId = getUid('editor-toolbar-style');
		const letterSpacingStyleId = getUid('editor-toolbar-style');

		onUnmounted(() => {
			Load.removeCSSCode(styleId);
			Load.removeCSSCode(lineHeightStyleId);
			Load.removeCSSCode(letterSpacingStyleId);
		});

		return {
			buttons,
			styleId,
			lineHeightStyleId,
			letterSpacingStyleId
		};
	},

	render() {
		const { buttons } = this;
		const renderGroup = (array) => {
			return array.map((item) => {
				if (typeof item === 'string') {
					if (item.includes('vc')) {
						let children = this.$slots.default?.() || [];
						switch (item) {
							case 'vc-image':
								return children[0];
							case 'vc-video':
								return children[2];
							case 'vc-undo':
								return children[4];
							case 'vc-redo':
								return children[6];
							default:
								return null;
						}
					}
					return (<button class={`ql-${item}`} />);
				}

				if (item instanceof Array) {
					return (
						<span class="ql-formats">
							{renderGroup(item)}
						</span>
					);
				}
				if (typeof item === 'object') {
					let [key, value] = Object.entries(item)[0];
					if (typeof value === 'string') {
						return <button class={`ql-${key}`} value={value} />;
					} 
					if (value instanceof Array) {
						let options = (value.length && value) || toolMap[key];
						if (key === 'size') {
							insertFontStyle(options, this.styleId);
						} else if (key === 'lineHeight') {
							insertLineHeightStyle(options, this.lineHeightStyleId);
						} else if (key === 'letterSpacing') {
							insertLetterSpacingStyle(options, this.letterSpacingStyleId);
						}
						
						return (
							<select class={`ql-${key}`}>
								{options.map((it) => {
									if (it === 'selected' || !it) {
										return <option selected="selected" />;
									}
									return <option value={`${it}`} />;
								})}
							</select>
						);
					}
					return null;
				}
				return null;
			});
		};

		return (
			<div id={`${this.uid}`}>
				{renderGroup(buttons)}
				{this.$slots.extend?.()}
			</div>
		);
	}
});