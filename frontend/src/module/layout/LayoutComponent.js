import { Elem, Transition, Txt } from 'modapp-base-component';
import { ModuleComponent, ModelQuickTxt } from 'component';
import MainComponent from './MainComponent';
import VolumeComponent from './VolumeComponent';
import MenuComponent from './MenuComponent';
import { Model } from 'modapp-resource';

class LayoutComponent extends ModuleComponent {

	constructor(app, module, params, model) {
		super("module.layout", module);

		this.app = app;
		this.module = module;
		this.params = params;
		this.model = model;
		this.defaultComponent = new MainComponent(this.app, this.module, this.params.main);

		this.time = new Model({
			eventBus: this.app.eventBus,
			namespace: 'module.layout.time.model',
			definition: {
				time: {
					type: '?string',
					default: ''
				}
			},
			data: {}
		});

		this._setListeners = this._setListeners.bind(this);

		this._modelChanged = this._modelChanged.bind(this);
		this._setRoute = this._setRoute.bind(this);
		this._setContent = this._setContent.bind(this);
		this._setComponent = this._setComponent.bind(this);
		this._setHomeButton = this._setHomeButton.bind(this);
		this._loadVolumeModel = this._loadVolumeModel.bind(this);
		this._renderVolume = this._renderVolume.bind(this);
		this._startTime = this._startTime.bind(this);
	}

	_modelChanged() {}

	_startTime() {
		var today = new Date();
		var h = today.getHours();
		var m = today.getMinutes();
		//var s = today.getSeconds();
		h = this._checkTime(h);
		m = this._checkTime(m);
		//s = this._checkTime(s);

		this.time.set({
			time: h + ":" + m
		});

		this.clockTimeout = setTimeout(this._startTime, 500);
	}

	_checkTime(i) {
		if (i < 10) {
			i = "0" + i;
		}

		return i;
	}

	render(el) {
		this.node = new Elem(n =>
			n.elem('body', 'div', {
				className: 'body grid-y medium-grid-frame'
			}, [
				n.elem('header', { className: 'cell shrink header medium-cell-block-container' }, [
					n.elem('div', {}, [
						n.elem('div', { className: 'home' }, [
							n.component('home', new Transition())
						]),
						n.elem('div', { className: 'time' }, [
							n.elem('span', { className: 'fas fa-fw fa-clock icon' }),
							n.component(new ModelQuickTxt(this.time, (m) => m.time))
						]),
						n.elem('div', { className: 'volume' }, [
							n.component('vol', new Transition())
						])
					])
				]),
				n.elem('main', {
					className: 'content cell medium-auto medium-cell-block-container'
				}, [
					n.elem('div', {
						className: 'container'
					}, [
						n.elem('div', {
							className: 'volume'
						}, [
							n.component('volume', new VolumeComponent(this.app, this.module, this.params.volume))
						]),
						n.elem('div', {
							className: 'main'
						}, [
							n.component('main', new Transition())
						])
					]),
				]),
				n.elem('footer', { className: 'cell shrink footer' }, [
					n.component('menu', new MenuComponent(this.app, this.module, this.params))
				])
			])
		);

		this._setListeners(true);

		this.node.render(el);

		this._loadVolumeModel();
		this._setRoute();
		this._startTime();
	}

	_loadVolumeModel() {
		this.module.client.get("audio.volume").then(m => {
			this.volume = m;
			this._renderVolume();
		}).catch(() => {});
	}

	_renderVolume() {
		let node = this.node.getNode('vol');

		let component = new Elem(n => n.elem('span', {}, [
			n.component(new ModelQuickTxt(this.volume, (m, e) => {
				if (m.mute) {
					e.removeClass('fa-volume-up');
					e.addClass('fa-volume-,ute');
				} else {
					e.removeClass('fa-volume-mute');
					e.addClass('fa-volume-up');
				}

				return '';
			}, { tagName: 'span', className: 'fas fa-fw icon' })),
			n.component(new ModelQuickTxt(this.volume, (m, e) => {
				if (m.mute) {
					e.addClass('disabled');
				} else {
					e.removeClass('disabled');
				}

				return m.volume + '%';
			}, { tagName: 'span' }))
		]));

		if (node && component) {
			node.fade(component);
		}
	}

	_setHomeButton(title) {
		if (!this.node) {
			return;
		}

		let node = this.node.getNode("home");
		if (!node) {
			return;
		}

		let component = new Txt(title, {
			tagName: 'span',
			className: 'start'
		});

		node.set(component);
	}

	_setRoute() {
		const current = this.module.router.getCurrent();
		let title = this.t(`main.menu.item.home`);

		if (current && current.route) {
			this._setComponent("main", current.route.component['main'], this.defaultComponent);
			title = this.t(`main.menu.item.${ current.route.id ? current.route.id : 'home' }`);
		} else {
			this._setComponent("main", this.defaultComponent);
		}

		this._setHomeButton(title);
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
				nodeItem.set(component);
			} else if (defaultComponent) {
				nodeItem.set(defaultComponent);
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

		if (this.clockTimeout) {
			clearTimeout(this.clockTimeout);
		}
	}
}

export default LayoutComponent;