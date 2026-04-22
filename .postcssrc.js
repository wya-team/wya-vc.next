module.exports = {
	plugins: [
		/**
		 * @imoport资源，引进使用的代码，而不是@import '../xxx';
		 */
		require('postcss-import')(),
		/**
		 * 将 url() 引用的资源（如 PhotoSwipe default-skin）内联为 data URI
		 * encodeType: base64 —— 含 .svg 也走 base64（默认可为 encodeURIComponent）
		 * 需放在 postcss-import 之后，以便从 node_modules 中正确 resolve 相对路径
		 */
		require('postcss-url')({
			url: 'inline',
			encodeType: 'base64',
			maxSize: 512
		}),
		require('postcss-flexbugs-fixes')(),
		/**
		 * 压缩代码，删除重复部分
		 */
		require('cssnano')(),
		/**
		 * 适配浏览器前缀
		 */
		require('autoprefixer')({ remove: false })
	]
};
