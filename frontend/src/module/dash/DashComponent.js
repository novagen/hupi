import { Elem, ModuleComponent, Gauge, Container } from 'component';

import 'scss/DashModule.scss';

class DashComponent extends ModuleComponent {
	constructor(app, module) {
		super('module.dash', module);

		this.app = app;
		this.module = module;

		this._loadModels = this._loadModels.bind(this);
		this._renderModels = this._renderModels.bind(this);
		this._debounce = this._debounce.bind(this);
		this._resizeContent = this._resizeContent.bind(this);
		this._getMeterSize = this._getMeterSize.bind(this);
	}

	render(el) {
		this.node = new Elem(n =>
			n.component('gauges', new Container({ className: 'dash' }))
		);

		this.node.render(el);
		this._loadModels();
	}

	_loadModels() {
		const promises = [];

		promises.push(this.module.client.get('dash.speedometer'));
		promises.push(this.module.client.get('dash.tachometer'));

		Promise.all(promises).then(r => {
			this.speedModel = r[0];
			this.tachModel = r[1];

			this._renderModels();
		}).catch(() => {});
	}

	_renderModels() {
		const node = this.node.getNode('gauges');

		const component = new Elem(n => n.elem('div', { className: 'meters' }, [
			n.component('speedometer', new Gauge(this.speedModel, {
				value: m => m.value,
				minValue: m => m.min,
				maxValue: m => m.max,
				minorTicks: 3,
				stepLength: 30
			})),
			n.component('tachometer', new Gauge(this.tachModel, {
				value: m => m.value,
				minValue: m => m.min,
				maxValue: m => m.max,
				minorTicks: 10,
				stepLength: 1000
			}))
		]));

		if (node && component) {
			node.set(component);
		}

		let size = this._getMeterSize(component.getNode('speedometer'));

		component.getNode('speedometer').setSize(size, size);
		component.getNode('tachometer').setSize(size, size);

		window.addEventListener('resize', this._debounce(this._resizeContent));
	}

	_debounce(func, time){
		time = time || 100;
		this.resizeTimer;

		return function(event){
			if(this.resizeTimer) {
				clearTimeout(this.resizeTimer);
			}

			this.resizeTimer = setTimeout(func, time, event);
		};
	}

	_getMeterSize(component) {
		let width = component._rootElem.el.offsetWidth;
		let height = this.node.getNode('gauges').div.offsetHeight;

		if (width >= height) {
			return height;
		}

		return width;
	}

	_resizeContent() {
		if (!this.node) { return; }

		const speedNode = this.node.getNode('gauges').current.ctx.getNode('speedometer');
		const tachNode = this.node.getNode('gauges').current.ctx.getNode('tachometer');

		let size = this._getMeterSize(speedNode);

		speedNode.setSize(size, size);
		tachNode.setSize(size, size);
	}

	unrender() {
		if(this.resizeTimer) {
			clearTimeout(this.resizeTimer);
		}

		this.node.unrender();
		this.node = null;
	}
}

export default DashComponent;