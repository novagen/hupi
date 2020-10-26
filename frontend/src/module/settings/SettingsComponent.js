import { Elem } from 'modapp-base-component';
import { ModuleComponent, Txt } from 'component';

class SettingsComponent extends ModuleComponent {
	constructor(app, module) {
		super('module.settings', module);

		this.app = app;
		this.module = module;
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem("div", { className: "settings" }, [
				n.component(new Txt(this.t('title', 'Settings'), { }))
			])
		);

		this.node.render(el);
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default SettingsComponent;