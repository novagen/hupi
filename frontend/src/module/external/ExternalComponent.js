import { Elem } from 'modapp-base-component';
import { ModuleComponent, Txt } from 'component';

class ExternalComponent extends ModuleComponent {
	constructor(app, module) {
		super('module.external', module);

		this.app = app;
		this.module = module;
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem("div", { className: "audio" }, [
				n.component(new Txt(this.t('title', 'External'), { }))
			])
		);

		this.node.render(el);
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default ExternalComponent;