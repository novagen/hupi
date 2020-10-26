import RootElem from './RootElem';
import { RadialGauge, LinearGauge } from 'canvas-gauges';

class Gauge extends RootElem {
	constructor(model, opt) {
		opt = Object.assign({
			type: 'radial',
			className: 'gauge',
			width: 400,
			height: 400,
			title: false,
			value: () => 0,
			minValue: () => 0,
			maxValue: () => 100,
			units: () => '',
			animationRule: 'dequad',
			animationDuration: 200,
			valueBox: false,
			borders: 0,
			stepLength: 10,
			minorTicks: 1,
			colorBarEnd: false,
			colorBarProgressEnd: false,
			barBeginCircle: false,
			borderShadowWidth: 0,
			barProgress: false,
			highlights: [],
			warnColor: 'rgba(200, 50, 50, .75)',
			needleType: 'arrow'
		}, opt);

		super('div', opt);

		this.model = model;
		this.opt = opt;

		this._handleChange = this._handleChange.bind(this);
		this._getConfig = this._getConfig.bind(this);

		this.setSize = this.setSize.bind(this);
	}

	render(el) {
		let nodeEl = super.render(el);

		switch (this.opt.type) {
			case 'radial':
				this.gauge = new RadialGauge(this._getConfig());
				break;
			case 'linear':
				this.gauge = new LinearGauge(this._getConfig());
				break;
			default:
				throw new Error('Gauge -> unknown type');
		}

		nodeEl.appendChild(this.gauge.options.renderTo);
		this.gauge.draw();

		this.model.on('change', this._handleChange);
		this.gauge.value = this.opt.value(this.model);

		return nodeEl;
	}

	setSize(width, height) {
		if (!this.gauge) { return; }

		this.gauge.update({
			width: width,
			height: height
		});
	}

	_getConfig() {
		const config = Object.assign({
			renderTo: document.createElement('canvas'),
		}, this.opt);

		config.maxValue = this.opt.maxValue(this.model);
		config.minValue = this.opt.minValue(this.model);
		config.units = this.opt.units(this.model);

		if (this.model.warnFrom) {
			config.highlights.push({ from: this.model.warnFrom, to: config.maxValue, color: this.opt.warnColor });
		}

		const majorTicks = [];
		const steps = config.maxValue / this.opt.stepLength;

		for (let i = 0; i <= steps; i++) {
			majorTicks.push(i * this.opt.stepLength);
		}

		config.majorTicks = majorTicks;

		return config;
	}

	unrender() {
		this.model.off('change', this._handleChange);
		this.gauge.destroy();
		super.unrender();
	}

	_handleChange() {
		let el = super.getElement();

		if (!el || !this.gauge) {
			return;
		}

		this.gauge.value = this.opt.value(this.model);
	}
}

export default Gauge;