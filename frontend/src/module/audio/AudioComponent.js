import { Elem } from 'modapp-base-component';
import { ModuleComponent, CollectionList, Txt, ModelTxt } from 'component';

class AudioComponent extends ModuleComponent {
	constructor(app, module, model) {
		super('module.audio', module);

		this.app = app;
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem("div", { className: "audio" }, [
				n.component(new Txt(this.t('title', 'Audio'), { })),
				n.component(new CollectionList(this.model.devices, item => new Elem(n => n.elem("li", { className: "" }, [
					n.component(new ModelTxt(item, i => i.name, { tagName: "span" }))
				])), {
					className: "",
					tagName: 'ul',
					subTagName: null
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

export default AudioComponent;