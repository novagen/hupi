import { Elem, Txt } from 'modapp-base-component';
import { ModuleComponent } from 'component';

import './VolumeComponent.scss';

class MainComponent extends ModuleComponent {
	constructor(app, module, params) {
		super('module.layout.volume', module);

		this.app = app;
		this.module = module;
		this.params = params;

		this._setListeners = this._setListeners.bind(this);
	}

	_setListeners(on) {
		if (on) {
			// this.module.router.on('add', this._addRoute);
			// this.module.router.on('remove', this._delRoute);
		} else {
			// this.module.router.off('add', this._addRoute);
			// this.module.router.off('remove', this._delRoute);
		}
	}

	render(el) {
		this.node = new Elem(n => n.elem("div", {
			className: 'grid-x'
		}, [
			n.elem('div', {
				className: 'cell'
			}, [
				n.component(new Txt('start'))
			])
		]));

		this._setListeners(true);
        this.node.render(el);
	}

	unrender() {
		this._setListeners(false);
		this.node.unrender();
		this.node = null;
	}
}

export default MainComponent;