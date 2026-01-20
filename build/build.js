const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');

const compiler = require('@vue/compiler-sfc');
// css
const postcss = require('postcss');
const sass = require('sass');
// babel
const babel = require('@babel/core');
const jsx = require('@vue/babel-plugin-jsx');
const ts = require('@babel/plugin-transform-typescript');
const importMeta = require('@babel/plugin-syntax-import-meta');
// ast
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const { parse } = require('@babel/parser');
// rollup 
const { rollup } = require('rollup');
const replace = require('@rollup/plugin-replace');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const alias = require('@rollup/plugin-alias');
const { terser } = require('rollup-plugin-terser');

// vite
const viteVue = require('@vitejs/plugin-vue');

const postcssOpts = require('../.postcssrc.js');

const { resolve, relative } = path;
const { log } = console;
const APP_ROOT = resolve(__dirname, '../');
const babelParseConfig = {
	sourceType: 'module',
	plugins: [
		'jsx',
		'typescript'
	]
};

// jsx/tsx -> js
const transform = (code) => {
	return babel.transformFromAstSync(code, undefined, {
		babelrc: false,
		ast: true,
		plugins: [
			importMeta,
			[jsx, {}],
			[
				ts,
				{
					isTSX: true, 
					allowExtensions: true
				}
			]
		],
		sourceMaps: true,
		// sourceFileName: '',
		configFile: false
	}).code;
};

let cssInfo = glob
	.sync(`src/*`, {
		ignore: ['src/{__tpl__,index.js}']
	})
	.reduce((pre, cur) => {
		pre[cur.replace(/src\//, '')] = [];
		return pre;
	}, {});

let thirdInfo = [];

const files = glob.sync(`src/**/*.{ts,tsx,js,jsx,scss,vue}`, {
	ignore: ['src/**/{__test__,examples,demo}/**', 'src/__tpl__/**']
});

// 文件检查
const _files = files.map((file) => file.replace(/\.(vue|js|scss|ts)x?$/, ''));
if (files.length !== [...new Set(_files)].length) {

	let reject;
	for (let i = 0; i < _files.length; i++) {
		if (i != _files.indexOf(_files[i])) {
			reject = _files[i];
			break;
		}
	}
	
	// ⚠️
	throw new Error(`${reject} + 文件存在重复, 不区分{tsx,ts,js,scss,vue}`);
}

const exportCssFile = (filepath, data, record = true, promise) => {
	if (!data) return promise ? Promise.resolve() : null;
	let result;

	let fn = (onSuccess, onError) => {
		try {
			result = sass.renderSync({
				data,
				file: filepath
			});
		} catch (e) {
			console.error(filepath, 'sass 解析失败');
			throw e;
		}
		
		// console.log(postcssOpts.plugins);
		postcss(postcssOpts.plugins)
			.process(result.css, { 
				from: filepath
			})
			.then(({ css }) => {
				filepath = resolve(APP_ROOT, filepath.replace(/src/, 'lib').replace(/\.(vue|ts|js|jsx|tsx|scss)/, '.css'));
				
				fs.outputFileSync(
					filepath, 
					css
				);

				onSuccess && onSuccess();
				if (!record) return;
				let [key, ...rest] = relative(resolve(APP_ROOT, './lib'), filepath).split('/');
				cssInfo[key].push(rest.join('/'));

				if (rest.join('/').includes('third.css')) {
					thirdInfo.push([key, ...rest].join('/'));
				}
			})
			.catch((e) => {
				onError && onError(e);
				console.error('css 生成失败', filepath, data);
				throw new Error(e);
			});
	};


	return promise 
		? new Promise(fn)
		: fn();
	
};

process.on('beforeExit', async () => {
	delete cssInfo.style;
	let totalCss = [];
	await Promise.all(Object.keys(cssInfo).map((i) => {
		if (cssInfo[i].length === 0) return;

		totalCss.push(i);
		return exportCssFile(
			resolve(APP_ROOT, './lib', `./${i}/index.css`), 
			// 如table/index.js -> [table.css, index.css]
			cssInfo[i]
				.filter(j => j !== 'index.css' && i.indexOf('third.css') === -1)
				// ⚠️ 要求组件的主入口必须和文件夹同名，否则样式会存在先后问题
				.reduce((pre, cur, index, source) => {
					pre[0] = pre[0] || [];
					pre[1] = pre[1] || [];
					if (cur.includes('mobile/')) {
						[`mobile/${i}.css`].some(item => cur === item) 
							? pre[1].unshift(cur)
							: pre[1].push(cur);
					} else {
						[`${i}.css`].some(item => cur === item) 
							? pre[0].unshift(cur)
							: pre[0].push(cur);
					}
					if (index === source.length - 1) {
						pre = pre[0].concat(pre[1]);
					}
					return pre;
				}, [])
				.map(j => `@import './${j}'`)
				.filter((j, index, source) => source.indexOf(j) != -1)
				.join(';\n') || '',
			false,
			true
		);
	}));

	await exportCssFile(
		resolve(APP_ROOT, './lib', './vc.reset.css'), 
		['style']
			.map(i => `@import './${i}/index.css'`)
			.join(';\n'),
		false,
		true
	);

	// 第三方资源
	await exportCssFile(
		resolve(APP_ROOT, './lib', './vc.third.css'), 
		thirdInfo
			.map(i => `@import './${i}'`)
			.join(';\n'),
		false,
		true
	);

	// 纯组件含有
	await exportCssFile(
		resolve(APP_ROOT, './lib', './vc.normal.css'), 
		[...new Set(['icon', 'image', 'button', 'input', 'spin', ...totalCss])]
			.map(i => `@import './${i}/index.css'`)
			.join(';\n'),
		false,
		true
	);

	// 全部
	await exportCssFile(
		resolve(APP_ROOT, './lib', './vc.min.css'), 
		[`@import './vc.reset.css'`, `@import './vc.third.css'`, `@import './vc.normal.css'`].join(';\n'),
		false,
		true
	);


	const input = resolve(APP_ROOT, './lib', './index.js');
	const plugins = [
		nodeResolve({ browser: true }), 
		commonjs({}), 
		replace({
			'__VC_VERSION__': process.env.VERSION || require('../package.json').version,
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
			preventAssignment: false
		}),
		terser()
	];

	// 含Vue
	let browserJS = await rollup({
		input,
		inlineDynamicImports: true,
		plugins: [
			alias({
				entries: [{
					find: /^vue$/, 
					replacement: 'vue/dist/vue.cjs.prod.js'
				}]
			}),
			...plugins
		],
		onwarn: (warning) => {
			console.warn(warning);
		}
	});
	await browserJS.write({
		output: {
			file: `lib/vc.browser.js`,
			format: 'umd',
			name: 'WYA_VC',
			exports: 'named'
		}
	});

	// 不含Vue
	let minJS = await rollup({
		input,
		plugins,
		inlineDynamicImports: true,
		external: filename => {
			let regex = ['^vue$'].join('|');
			return new RegExp(`(${regex})`).test(filename);
		}
	});

	await minJS.write({
		output: {
			file: `lib/vc.min.js`,
			format: 'umd',
			name: 'WYA_VC',
			exports: 'named',
			globals: {
				vue: 'Vue'
			},
		}
	});

	// 不含第三方
	let commonJS = await rollup({
		input,
		plugins,
		inlineDynamicImports: true,
		external: filename => {
			let regex = [
				'^vue$', 
				'^html2canvas$', 
				'^echarts$', 
				'^quill$',
				'^photoswipe$',
				'^photoswipe/dist/photoswipe-ui-default$'
			].join('|');

			return new RegExp(`(${regex})`).test(filename);
		},
	});
	await commonJS.write({
		output: {
			file: `lib/vc.common.js`,
			format: 'umd',
			name: 'WYA_VC',
			exports: 'named',
			globals: {
				vue: 'Vue',
				echarts: 'echarts',
				photoswipe: 'PhotoSwipe',
				'photoswipe/dist/photoswipe-ui-default': 'PhotoSwipeUI_Default',
				quill: 'Quill',
				html2canvas: 'html2canvas',
			},
		}
	});

	// 异常处理
	const cssFiles = glob.sync(`src/**/*.m.css`);

	if (cssFiles.length > 0) {
		throw new Error('不存在m.css');
	}

	console.log('Build Success!!!');
	process.exit();
});

// 路口文件，用于退出时的打包
const entryPath = resolve(APP_ROOT, './src/index.ts');
const entryContent = fs.readFileSync(entryPath, 'utf-8');
fs.outputFileSync(
	resolve(APP_ROOT, './lib/index.js'), 
	transform(parse(entryContent, babelParseConfig))
);

// 预编译文件
files.forEach((filepath) => {
	const FILE_PATH = resolve(APP_ROOT, filepath);
	const FILE_CONTENT = fs.readFileSync(FILE_PATH, 'utf-8');
	const file = path.parse(FILE_PATH);
	const type = file.ext.replace(/\./, '').replace(/(jsx|tsx|ts)/, 'js');

	let fns = {
		js: () => {
			const outputFilepath = resolve(APP_ROOT, filepath.replace(/src/, 'lib').replace(/\.(jsx|tsx|ts)/, '.js'));

			let styleImport = [];
			let scriptAST = parse(
				FILE_CONTENT || 'export default {};',
				babelParseConfig
			);

			traverse(scriptAST, {
				// css
				ImportDeclaration($path) {
					let { value } = $path.node.source;
					if (/\.(scss|css)$/.test(value)) {
						styleImport.push(`@import "${value}";`);
						$path.remove();
					}

					// 去掉.vue后缀
					if (/\.(vue)$/.test(value)) {
						$path.node.source.value = value.replace(/\.vue/, '');
					}
				},
				ExportNamedDeclaration($path) {
					if ($path.node.source) {
						let { value } = $path.node.source;
						// 去掉.vue后缀
						if (/\.(vue)$/.test(value)) {
							$path.node.source.value = value.replace(/\.vue/, '');
						}
					}
				}
			});

			styleImport.length > 0 && (
				exportCssFile(filepath, styleImport.join(`\n`))
			);

			fs.outputFileSync(
				outputFilepath, 
				transform(scriptAST)
			);
		},
		vue: () => {
			const outputFilepath = resolve(APP_ROOT, filepath.replace(/src/, 'lib').replace(/\.vue/, '.js'));
			const { descriptor } = compiler.parse(FILE_CONTENT);
			const { script, template, styles } = descriptor;
			const hasTemplate = template && template.content;
			const RENDER_KEY = 'render';
			const RENDER_VALUE = '__$$render';

			let renderImport = '';
			let renderAST = t.objectProperty(
				t.identifier(RENDER_KEY),
				t.identifier(RENDER_VALUE)
			);
			// 输出[filename].render.js
			if (hasTemplate) {
				const result = compiler.compileTemplate({
					id: ' ',
					filename: file.name,
					source: template.content,
					preprocessLang: template.lang
				});

				fs.outputFileSync(
					outputFilepath.replace(/\.js/, '.render.js'), 
					result.code
				);

				renderImport = `import { ${RENDER_KEY} as ${RENDER_VALUE} } from './${file.name}.render'\n`;
			}
			let styleImport = [];
			let scriptAST = parse(
				renderImport + ((script && script.content) || 'export default {};'),
				babelParseConfig
			);

			traverse(scriptAST, {
				// css
				ImportDeclaration($path) {
					let { value } = $path.node.source;
					if (/\.(scss|css)$/.test(value)) {
						styleImport.push(`@import "${value}";`);
						$path.remove();
					}

					// 去掉.vue后缀
					if (/\.(vue)$/.test(value)) {
						$path.node.source.value = value.replace(/\.vue/, '');
					}
				},

				// export default
				ExportDefaultDeclaration($path) {
					if (!renderImport || !$path.node.declaration.properties) return;
					$path.node.declaration.properties.push(renderAST);
				},

				// defineComponent
				CallExpression($path) {
					if (
						!renderImport 
						|| $path.node.callee.name !== 'defineComponent'
						|| !$path.node.arguments[0].properties
					) return;

					$path.node.arguments[0].properties.push(renderAST);
				},

				// portal【portal, 只能是wrapperComponent】
				VariableDeclarator($path) {
					if (
						!renderImport 
						|| !/(w|W)rapperComponent/.test($path.node.id.name) 
						|| !$path.node.init.properties
					) return;
					$path.node.init.properties.push(renderAST);
				},

				// ⚠️
				NewExpression($path) {
					if ($path.node.callee.name === 'Portal') {
						let arg0 = $path.node.arguments[0].name;
						if (!/(w|W)rapperComponent/.test(arg0)) {
							throw new Error(`
								\nPortal第一个参数应该命名为wrapperComponent
								\n当前值: ${arg0}
								\n文件: ${FILE_PATH}
							`);
						}
					}
				}
			});

			fs.outputFileSync(
				outputFilepath, 
				transform(scriptAST)
			);

			styleImport = styleImport
				.concat((styles || []).map(i => i.content))
				.join(`\n`);

			exportCssFile(filepath, styleImport);
		},
		scss: () => {
			exportCssFile(filepath, FILE_CONTENT);
		},
		css: () => {
			exportCssFile(filepath, FILE_CONTENT);
		}
	};

	fns[type] && fns[type]();
});
