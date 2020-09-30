import { Elem, Txt, Input, Button } from 'modapp-base-component';
import { ModuleComponent } from 'component';

import './LoginComponent.scss';


class LoginComponent extends ModuleComponent {
	constructor(app, module, params) {
		super(module);

		this.app = app;
		this.module = module;
		this.params = params;

		this._login = this._login.bind(this);
    }

    _login() {
        let username = this.node.getNode("username").getValue();
        let password = this.node.getNode("password").getValue();
        let verification = this.node.getNode("verification").getValue();

		this.module.client.connect().then(() => {
			this.module.client.authenticate("user", "login", {
				username: username,
				password: password,
				code: verification
			}).then(u => {
				this.module.client.getModel().set({ token : u.token, id: u.id });
			}).catch(() => {});
		});
	}

	render(el) {
        this.el = el;

		this.node = new Elem(n =>
            n.elem("form", { className: "login-container", events: { submit: (_, e) => e.preventDefault() } }, [
				n.component(new Txt(this.t("module_layout_login_title"), { className: 'login-header' })),
				n.elem("div", [
					n.component(new Txt(this.t("module_layout_login_username"))),
					n.component("username", new Input("", {
						attributes: {
							autofocus: "autofocus",
							autocomplete: "username"
						},
						events: {
							"keypress": (e, v) => {
								if (v.keyCode == 13) {
									this._login(e, v);
								}
							}
						}
					}))
				]),
				n.elem("div", [
					n.component(new Txt(this.t("module_layout_login_password"))),
					n.component("password", new Input("", {
						attributes: {
							type: "password",
							autocomplete: "current-password"
						},
						events: {
							"keypress": (e, v) => {
								if (v.keyCode == 13) {
									this._login(e, v);
								}
							}
						}
					}))
				]),
				n.elem("div", { className: this.params.enable2FA ? "" : "hidden" }, [
					n.component(new Txt(this.t("module_layout_login_2fa"))),
					n.component("verification", new Input("", {
						events: {
							"keypress": (e, v) => {
								if (v.keyCode == 13) {
									this._login(e, v);
								}
							}
						}
					}))
				]),
				n.elem("div", [
					n.component("inputBtn", new Button(this.t("module_layout_login_button_login"), this._login, { className: "button", attributes: { type: 'button' } }))
				])
			])
		);

		if (!this.module.client.getModel().token) {
			this.node.render(el);
		}
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default LoginComponent;