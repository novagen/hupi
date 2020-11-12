import { Elem } from 'modapp-base-component';
import { ModuleComponent, Txt, ModelTxt } from 'component';

class LocationComponent extends ModuleComponent {
	constructor(app, module, model) {
		super('module.location', module);

		this.app = app;
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem("div", { className: "location" }, [
				n.component(new Txt(this.t('title', 'Location'), { })),
				n.component(new ModelTxt(this.model.data, i => i.lat.toString(), { tagName: "div" })),
				n.component(new ModelTxt(this.model.data, i => i.lon.toString(), { tagName: "div" }))
			])
		);

		this.node.render(el);
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default LocationComponent;