import { Elem } from 'modapp-base-component';
import { ModuleComponent } from 'component';
import { Txt } from 'modapp-base-component';

import './SettingsComponent.scss';

class Settings extends ModuleComponent {
	constructor(app, module) {
		super('module.settings', module);

		this.app = app;
		this.module = module;
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem("div", { className: "settings" }, [
				n.component(new Txt(this.t(`title`), { }))
			])
		);

		this.node.render(el);
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default Settings;