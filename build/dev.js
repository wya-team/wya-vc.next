const { createServer } = require('vite');
const chalk = require('chalk');
const vue = require('@vitejs/plugin-vue');
const vueJsx = require('@vitejs/plugin-vue-jsx');
const { resolve } = require('path');
const Prompt = require('./dev/prompt');
const Gen = require('./dev/gen');
const { host } = require('./utils');

const { log } = console;

(async () => {
	let { port, component } = await new Prompt().run();
	let { entry, tempDir } = await new Gen({ component }).run();

	const server = await createServer({
		configFile: false,
		root: resolve(__dirname, '../', tempDir),
		server: {
			host,
			port,
		},
		// 为了IDE支持，建议项目中都带上.vue
		resolve: {
			alias: [],
			extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
		},
		plugins: [vue(), vueJsx()],
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: ''
				}
			}
		}
	});
	let $server = await server.listen();
	let $port = $server.config.server.port;

	log(`\n`);
	entry.forEach((item) => log(`  > ${item}: ${chalk.cyan(`http://${host}:${$port}/${item}.html`)}`));
	log(`\n`);
})();