const path = require('path');
const upath = require('upath');
const fs = require('fs-extra');
const { render } = require('ejs');

const APP_ROOT = path.resolve(__dirname, '../../'); // -> process.cwd();

class Gen {
	constructor(options) {
		const { component } = options;

		this.tempDir = '.temp';
		this.component = component;
		this.entry = [];

		// 清空
		fs.emptyDirSync(path.resolve(APP_ROOT, this.tempDir));
	}

	getIndexHTMLContent() {
		const html = fs.readFileSync(path.resolve(__dirname, './index.ejs'));
		return render(html.toString(), {
			title: '@wya/vc',
			base: '/',
			pages: this.entry
		});
	}

	// 入口文件
	getJSContent(entryPath, fullpath) {
		let relativePath = path.relative(path.join(entryPath, '../'), fullpath);
		relativePath = upath.normalize(relativePath);
		let contents = '';
		contents += `\nimport { createApp } from 'vue'\n`;

		// css注入
		let stylePath = path.relative(path.join(entryPath, '../'), 'src/style');
		stylePath = upath.normalize(stylePath);
		contents += `\nimport '${stylePath}';\n`;

		contents += `\nimport App from '${relativePath}';\n`;

		contents += `\nconst app = createApp(App);\n`;
		contents += `\napp.mount('#app');\n`;
		contents += `\ntypeof window !== 'undefined' && (window.app = app);\n`;
		return contents;
	}

	getHTMLContent(basename) {
		let contents = '';
		contents += `<!DOCTYPE html>\n`;
		contents += `<html lang="en">\n`;
		contents += `	<head>\n`;
		contents += `		<meta charset="UTF-8" />\n`;
		contents += `		<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n`;
		contents += `		<title>@wya/vc-${basename}</title>\n`;
		contents += `	</head>\n`;
		contents += `	<body>\n`;
		contents += `		<div id="app"></div>\n`;
		contents += `		<script type="module" src="./${basename}.ts"></script>\n`;
		contents += `	</body>\n`;
		contents += `</html>\n`;
		return contents;
	}

	run(dir) {
		dir = dir || '.';
		const directory = path.join(APP_ROOT, 'src', dir);

		// 将返回一个包含“指定目录下所有文件名称”的数组对象
		fs.readdirSync(directory).forEach((file) => {
			// 文件地址
			const fullpath = path.join(directory, file);
			const paths = upath.normalize(fullpath).split('/') || [];
			// 获取文件信息
			const stat = fs.statSync(fullpath);
			// 获取文件后缀名
			const extname = path.extname(fullpath);
			if (stat.isFile() 
				&& (/\.(ts|js|vue)x?$/.test(extname)) 
				&& (!this.component || fullpath.includes(this.component))
				&& paths.length >= 2 && paths[paths.length - 2] === 'examples'
			) {
				// 获取文件名字
				const basename = path.basename(file, extname);
				const name = upath.normalize(path.join(dir, basename));
				const entryFile = path.join(this.tempDir, upath.normalize(dir).replace(/\/examples/, ''), file);

				// 输出文件
				fs.outputFileSync(
					entryFile.replace(/\.vue/, '.ts'), 
					this.getJSContent(entryFile, fullpath)
				);

				fs.outputFileSync(
					entryFile.replace(/\.vue/, '.html'), 
					this.getHTMLContent(basename)
				);

				// 记录
				this.entry.push(name.replace(/\/examples/, ''));
			} else if (stat.isDirectory() && file !== 'dist') {
				const subdir = path.join(dir, file);
				this.run(subdir);
			}
		});

		// 输出文件
		fs.outputFileSync(
			path.join(APP_ROOT, this.tempDir, '/index.html'), 
			this.getIndexHTMLContent()
		);

		return this;
	}
}

module.exports = Gen;
