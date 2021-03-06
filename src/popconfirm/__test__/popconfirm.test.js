import { createVue, destroyVM } from '@tests/helper';
import Popconfirm from '..';

describe('Popconfirm', () => {
	let vm;

	afterEach(() => {
		vm && destroyVM(vm);
	});
	it('basic', () => {
		expect(!!Popconfirm).to.equal(true);
	});

	const createVM = (options = {}) => {
		const { promise = true } = options;

		const contentRender = (h) => {
			return h(
				'div',
				{
					class: '_content'
				},
				'This is content'
			);
		};
		return createVue({
			template: `
				<vc-popconfirm 
					v-model="visible" 
					ref="popconfirm" 
					:renderContent="contentRender"
					@ok="handleOk"
				>
					<div class="_trigger">trigger</div>
				</vc-popconfirm>
			`,
			components: {
				'vc-popconfirm': Popconfirm
			},
			data() {
				return {
					visible: false,
					flag: false,
					promise
				};
			},
			methods: {
				contentRender,
				handleOk(e, cb) {
					if (this.promise) {
						return new Promise((resolve, reject) => {
							if (this.flag) {
								cb();
								resolve();
							} else {
								reject();
							}
						});
					}
				}
			}
		});
	};

	it('cancel', done => {
		vm = createVM();

		const popEl = vm.$refs.popconfirm.$el;

		popEl.querySelector('._trigger').click();

		expect(vm.visible).to.be.true;

		setTimeout(() => {
			const content = document.body.querySelector('._content');
			expect(vm.visible).to.be.true;
			expect(content).to.be.exist;

			const footerBtns = document.body.querySelectorAll('.vc-popconfirm__footer .vc-btn');
			footerBtns[0].click();
		}, 500);

		setTimeout(() => {
			const content = document.body.querySelector('._content');
			expect(vm.visible).to.be.false;
			expect(content).to.be.null;
			done();
		}, 1000);

	});

	it('sync ok', done => {

		vm = createVM({ promise: false });

		const instance = vm.$refs.popconfirm;
		instance.$el.querySelector('._trigger').click();

		expect(vm.visible).to.be.true;

		let actionBtns;
		let content;

		setTimeout(() => {
			content = document.body.querySelector('._content');
			expect(vm.visible).to.be.true;
			expect(content).to.be.exist;

			actionBtns = document.body.querySelectorAll('.vc-popconfirm__footer .vc-btn');
			actionBtns[1].click();
		}, 500);

		setTimeout(() => {
			content = document.body.querySelector('._content');
			expect(vm.visible).to.be.false;
			expect(content).to.be.null;
			done();
		}, 1000);
	});

	it('promise ok', done => {
		vm = createVM();

		const instance = vm.$refs.popconfirm;
		instance.$el.querySelector('._trigger').click();

		expect(vm.visible).to.be.true;

		let actionBtns;
		let content;

		// ?????????????????????popover
		setTimeout(() => {
			content = document.body.querySelector('._content');
			expect(vm.visible).to.be.true;
			expect(content).to.be.exist;

			actionBtns = document.body.querySelectorAll('.vc-popconfirm__footer .vc-btn');
			// ?????????????????????????????????reject
			actionBtns[1].click();
		}, 500);

		// ??????????????????popover????????????
		setTimeout(() => {
			content = document.body.querySelector('._content');
			expect(vm.visible).to.be.true;
			expect(content).to.be.exist;

			// ???????????????????????????????????????resolve
			vm.flag = true;
			actionBtns[1].click();
		}, 1000);

		// ??????????????????popover???????????????dom????????????
		setTimeout(() => {
			content = document.body.querySelector('._content');
			expect(vm.visible).to.be.false;
			expect(content).to.be.null;
			done();
		}, 1500);
	});
});