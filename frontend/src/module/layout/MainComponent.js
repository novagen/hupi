import { Elem } from 'modapp-base-component';
import { ModuleComponent } from 'component';

import './VolumeComponent.scss';
import PlayingComponent from './PlayingComponent';

class MainComponent extends ModuleComponent {
	constructor(app, module, params) {
		super('module.layout.volume', module);

		this.app = app;
		this.module = module;
		this.params = params;
	}

	render(el) {
		this.node = new Elem(n => n.elem("div", {
			className: 'grid-x'
		}, [
			n.elem('div', {
				className: 'cell'
			}, [
				n.component(new PlayingComponent(this.app, this.module, this.params))
			])
		]));

        this.node.render(el);
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default MainComponent;