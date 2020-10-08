import { Elem } from 'modapp-base-component';
import { CollectionList, ModuleComponent } from 'component';
import { Model, Collection } from 'modapp-resource';
import { ModelTxt } from 'modapp-resource-component';

import './MainComponent.scss';

const menuSorter = (a, b) => {
	let ao = typeof (a.order) === 'number' ? a.order : -1,
		bo = typeof (b.order) === 'number' ? b.order : -1;

	if (ao === bo) {
		return a.name.localeCompare(b.name);
	}

	// Non-set sortOrder should come after all sorted values
	if (ao === -1 || bo === -1) {
		return ao === -1 ? 1 : -1;
	}

	return ao - bo;
};

class MainComponent extends ModuleComponent {
	constructor(app, module, params) {
		super('module.layout.main', module);

		this.app = app;
		this.module = module;
		this.params = params;

		this.navigation = new Collection({
			namespace: 'navigation',
			eventBus: this.app.eventBus,
			idAttribute: m => m.id,
			compare: menuSorter
		});

		this._gotoPage = this._gotoPage.bind(this);
		this._addNavigation = this._addNavigation.bind(this);
		this._delNavigation = this._delNavigation.bind(this);
		this._addRoute = this._addRoute.bind(this);
		this._delRoute = this._delRoute.bind(this);

		this._setListeners = this._setListeners.bind(this);
	}

	_setListeners(on) {
		if (on) {
			this.module.router.on('add', this._addRoute);
			this.module.router.on('remove', this._delRoute);
		} else {
			this.module.router.off('add', this._addRoute);
			this.module.router.off('remove', this._delRoute);
		}
	}

	_gotoPage(page) {
		this.module.router.setRoute(page);
	}

	_addRoute(route) {
		this._addNavigation(route);
	}

	_delRoute(route) {
		this._delNavigation(route.id);
	}

	_initNavigation() {
		let routes = this.module.router.getRoutes();

		if (routes) {
			for (let key in routes) {
				const route = routes[key];
				if (route.parentId) {
					continue;
				}

				this._addNavigation(route);
			}
		}
	}

	_addNavigation(item) {
		if (item.parentId || item.id === '' || this.navigation.get(item.id)) {
			return;
		}

		let navItem = new Model({
			namespace: 'navigation',
			eventBus: this.app.eventBus,
			data: item
		});

		this.navigation.add(navItem);
	}

	_delNavigation(id) {
		if (this.navigation.get(id).parentId) {
			return;
		}

		this.navigation.remove(id);

		let currentRoute = this.module.router.getCurrent();
		let defaultRoute = this.module.router.getDefaultRoute();

		if (defaultRoute && currentRoute && currentRoute.route.id === id) {
			if (defaultRoute) {
				this.module.router.setRoute(defaultRoute.routeId, defaultRoute.params);
			}
		}
	}

	render(el) {
		this.node = new Elem(n => n.component("list", new CollectionList(this.navigation, m => {
			return new Elem(e => e.elem('div', {
				events: {
					click: () => {
						this._gotoPage(m.id);
					}
				}
			}, [
				e.elem('span', {
					className: 'fas fa-check'
				}),
				e.component(new ModelTxt(m, m => this.t(`menu.item.${m.name}`), {
					tagName: "span",
					className: ''
				}))
			]));
		}, {
			className: "grid-x main-items",
			tagName: 'div',
			subTagName: 'div',
			subClassName: m => 'cell small-3 item icon_' + m.id
		})));

		this._initNavigation();
		this._setListeners(true);

		this.node.render(el);
	}

	unrender() {
		this._setListeners(false);
		this.node.unrender();
		this.node = null;
	}
}

export default MainComponent;