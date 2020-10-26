import { Elem } from 'modapp-base-component';
import ModelRadio from './ModelRadio.js';
import Txt from './Txt.js';

class CustomRadio {
	constructor(model, label, value, change, opt) {
		this.model = model;
		this.label = label || "";
		this.value = value ? value : () => '';
		this.change = change ? change : () => {};
		this.opt = Object.assign({
			className: 'radio',
			id: "gen_id_" + btoa(Math.random()),
			name: "gen_name_" + btoa(Math.random())
		}, opt);

		if (!this.opt.className.includes("radio")) {
			this.opt.className += " radio";
			this.opt.className = this.opt.className.trim();
		}
	}

	render(el) {
		this.node = new Elem(n => n.elem("div", { className: this.opt.className }, [
			n.elem("div", { className: "switch tiny" }, [
				n.component(this.opt.id, new ModelRadio(this.model, this.value, this.change, { className: "switch-input", attributes: { id: this.opt.id, name: this.opt.name }})),
				n.elem("label", { className: "switch-paddle", attributes: { for: this.opt.id } })
			]),
			n.component(new Txt(this.label, { tagName: "label", attributes: { for: this.opt.id } }))
		]));

		this.node.render(el);
	}

	isChecked() {
		if (!this.node.getNode(this.id)) {
			return false;
		}

		return this.node.getNode(this.id).isChecked();
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default CustomRadio;