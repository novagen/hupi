import { Elem } from 'modapp-base-component';
import Txt from './Txt';

class Dialog {
	constructor(title, confirm, cancel, opt) {
		this.title = title;
		this.confirm = confirm ? confirm : () => { return new Promise((resolve, _) => { resolve(true); }); };
		this.cancel = cancel ? cancel : () => { return new Promise((resolve, _) => { resolve(true); }); };

		if (!opt.translator) {
			throw "Missing translator, must be set in opt";
		}

		this.opt = Object.assign({
			messageBuilder: null,
			errorLogger: () => {},
			closeOnError: true,
			yesString: opt.translator.t("dialog_button_ok", 'OK'),
			noString: opt.translator.t("dialog_button_cancel", 'Avbryt'),
			yesClassName: "button success right",
			noClassName: "button alert left"
		}, opt);

		this._createBody = this._createBody.bind(this);
		this._createDialogBody = this._createDialogBody.bind(this);
		this._createOkButton = this._createOkButton.bind(this);
		this._runConfirm = this._runConfirm.bind(this);
	}

	_createBody(n) {
		let components = [];

		if(this.opt.messageBuilder) {
			components.push(n.component(this.opt.messageBuilder()));
		}

		this.okButton = this._createOkButton();
		return components;
	}

	_createDialogBody(n) {
		return this._createBody(n);
	}

	_createOkButton() {
		const okButton = new Txt(this.opt.yesString, {
			tagName: "span", className: this.opt.yesClassName, events: {
				click: () => { this._runConfirm(); }
			}
		});

		return okButton;
	}

	_runConfirm() {
		this.confirm().then(() => {
			this.node.unrender();
		}).catch(e => {
			this.opt.errorLogger(e);

			if (this.opt.closeOnError) {
				this.node.unrender();
			}
		});
	}

	render(el) {
		if (this.node) {
			throw "Component already rendered";
		}

		this.node = new Elem(n => n.elem('div', { className: "dialog_overlay" }, [
			n.elem('div', { className: "dialog" }, [
				n.component(new Txt(this.title, { tagName: "div", className: "title" })),
				n.elem('div', { className: "body" }, this._createDialogBody(n)),
				n.elem('div', { className: "buttons" }, [
					n.component(this.okButton),
					n.component(new Txt(this.opt.noString, {
						tagName: "span", className: this.opt.noClassName, events: {
							click: () => {
								this.cancel().then(() => {
									this.node.unrender();
								}).catch(e => {
									this.opt.errorLogger(e);

									if (this.opt.closeOnError) {
										this.node.unrender();
									}
								});
							}
						}
					})),
				])
			])
		]));

		this.node.render(el);
	}

	unrender() {
		if (!this.node) {
			return;
		}

		this.node.unrender();
		this.node = null;
	}
}

export default Dialog;
