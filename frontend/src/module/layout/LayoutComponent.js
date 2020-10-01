import { Elem, Transition, Txt } from 'modapp-base-component';
import { ModuleComponent } from 'component';
import MainComponent from './MainComponent';

class LayoutComponent extends ModuleComponent {

	constructor(app, module, params, model) {
		super("module.layout", module);

		this.app = app;
		this.module = module;
		this.params = params;
		this.model = model;
		this.defaultComponent = new MainComponent(this.app, this.module);

		this._setListeners = this._setListeners.bind(this);

		this._modelChanged = this._modelChanged.bind(this);
		this._setRoute = this._setRoute.bind(this);
		this._setContent = this._setContent.bind(this);
		this._setComponent = this._setComponent.bind(this);
		this._setHomeButton = this._setHomeButton.bind(this);
	}

	_modelChanged() {
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem('body', 'div', { className: 'body' }, [
				n.elem('header', { }, [
					n.elem('div', { }, [
						n.component('home', new Transition())
					])
				]),
				n.elem('main', { className: 'content' }, [
					n.component('main', new Transition())
				])
			])
		);

		this._setListeners(true);

		this.node.render(el);

		this._setRoute();
	}

	_setHomeButton(isHome) {
		if (!this.node) { return; }

		let node = this.node.getNode("home");
		if (!node) { return; }

		let component = new Txt(isHome ? this.t(`button.start`) : this.t(`button.back`), {
			tsgName: 'span',
			className: 'start',
			events: {
				click: () => {
					if (isHome) { return; }
					this.module.router.setRoute(null);
				}
			}
		});

		node.set(component);
	}

	_setRoute() {
		const current = this.module.router.getCurrent();

		if (current && current.route) {
			this._setComponent("main", current.route.component['main'], this.defaultComponent);
		} else {
			this._setComponent("main", this.defaultComponent);
		}

		this._setHomeButton(!current || !current.route || current.route.id === '');
	}

	_setContent() {
		const current = this.module.router.getCurrent();

		if (current && current.route) {
			this._setComponent("main", current.route.component['main'], null);
		}
	}

	_setComponent(nodeId, component, defaultComponent) {
		if (this.node) {
			const nodeItem = this.node.getNode(nodeId);

			if (!nodeItem) {
				return;
			}

			if (component) {
				nodeItem.fade(component);
			} else if (defaultComponent) {
				nodeItem.fade(defaultComponent);
			}
		}
	}

	_setListeners(on) {
		if (on) {
			this.module.router.on('set', this._setRoute);
			this.model.on('change', this._modelChanged);
		} else {
			this.module.router.off('set', this._setRoute);
			this.model.off('change', this._modelChanged);
		}
	}

	unrender() {
		this._setListeners(false);
		this.node.unrender();
		this.node = null;
	}
}

export default LayoutComponent;