import { Elem } from 'modapp-base-component';
import { CollectionList, ModuleComponent } from 'component';
import { ModelTxt } from 'modapp-resource-component';

import './PermissionComponent.scss';

class PermissionComponent extends ModuleComponent {
	constructor(app, module, params, model) {
		super(module);

		this.app = app;
		this.module = module;
		this.params = params;
		this.model = model;
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem("div", { className: "permissions" }, [
				n.component('permissions', new CollectionList(this.module.permission.collection, m => {
					return new ModelTxt(m, (i, e) => {
						this.t(`module_layout_permission__desc_${i.description}`).then(r => {
							e.setProperty("title", r);
						});

						return this.t(`module_layout_permission_name_${i.name}`);
					}, {
						events: {
							click: () => {
								m.request(this.model, this.params).then(() => {
									this.module.permission.remove(m.name);
								}).catch(() => {});
							}
						},
						className: 'item'
					});
				},
				{
					tagName: 'ul',
					subTagName: 'li'
				}))
			])
		);

		this.node.render(el);
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default PermissionComponent;