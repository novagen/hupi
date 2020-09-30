import { Elem, Transition } from 'modapp-base-component';
import MainComponent from './MainComponent';
import PermissionComponent from './PermissionComponent';
import { Loader } from 'component';

class LayoutComponent {

	constructor(app, module, params, model) {
		this.app = app;
		this.module = module;
		this.params = params;
		this.model = model;
		this.defaultComponent = new MainComponent(this.app, this.module);

		this._setListeners = this._setListeners.bind(this);

		this._modelChanged = this._modelChanged.bind(this);
		this._setRoute = this._setRoute.bind(this);
		this._addRoute = this._addRoute.bind(this);
		this._delRoute = this._delRoute.bind(this);
		this._setContent = this._setContent.bind(this);
		this._setComponent = this._setComponent.bind(this);
	}

	_modelChanged() {
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem('body', 'div', { className: 'body' }, [
				n.elem('main', { className: 'content' }, [
					n.component(new PermissionComponent(this.app, this.module, this.params, this.model)),
					n.component('main', new Transition()),
					n.component('loader', new Loader(this.model))
				])
			])
		);

		this._setListeners(true);

		this.node.render(el);
		this.module.loader = this.node.getNode("loader");

		this._setRoute();
	}

	_setRoute() {
		const current = this.module.router.getCurrent();

		if (current && current.route) {
			this._setComponent("main", current.route.component['main'], this.defaultComponent);
		} else {
			this._setComponent("main", this.defaultComponent);
		}
	}

	_addRoute() {
	}

	_delRoute() {
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
			this.module.router.on('add', this._addRoute);
			this.module.router.on('remove', this._delRoute);
			this.model.on('change', this._modelChanged);
		} else {
			this.module.router.off('set', this._setRoute);
			this.module.router.off('add', this.addRoute);
			this.module.router.off('remove', this.delRoute);
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