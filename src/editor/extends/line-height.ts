import { lineHeight } from '../constant';

export const registerLineHeight = (Quill, whitelist = lineHeight) => {
	// 设置的样式1.2为class不起由于有.不生效, 默认扩大十倍
	whitelist = whitelist.map((i) => String(i * 10));

	const Parchment = Quill.import("parchment");
	class LineHeightAttributor extends Parchment.Attributor.Class {}
	const lineHeightStyle = new LineHeightAttributor("lineHeight", "ql-lineHeight", 
		{ scope: Parchment.Scope.INLINE, whitelist });

	Quill.register({ "formats/lineHeight": lineHeightStyle }, true);
};