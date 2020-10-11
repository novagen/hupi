import { Elem, Transition, Txt } from 'modapp-base-component';
import { ModuleComponent } from 'component';
import { ModelInput, ModelComponent } from 'modapp-resource-component';

import './VolumeComponent.scss';

class VolumeComponent extends ModuleComponent {
	constructor(app, module, params) {
		super('module.layout.volume', module);

		this.app = app;
		this.module = module;
		this.params = params;

		this._setListeners = this._setListeners.bind(this);
		this._renderVolume = this._renderVolume.bind(this);
		this._load = this._load.bind(this);
		this._setVolume = this._setVolume.bind(this);
	}

	_setListeners(on) {
		if (on) {
			// this.module.router.on('add', this._addRoute);
			// this.module.router.on('remove', this._delRoute);
		} else {
			// this.module.router.off('add', this._addRoute);
			// this.module.router.off('remove', this._delRoute);
		}
	}

	_load() {
		this.module.client.get("audio.volume").then(m => {
			this.model = m;
			this._renderVolume();
		}).catch(() => {});
	}

	_renderVolume() {
		let node = this.node.getNode('volume');
		let component = new Elem(n => n.elem('div', {
			className: 'volume-grid'
		}, [
			n.elem('div', {
				className: 'volume-button'
			}, [
				n.component(new ModelComponent(this.model, new Elem(c => c.elem('span', {
					className: 'button',
					events: {
						click: () => {
							this.model.set({
								mute: !this.model.mute
							});
						}
					}
				}, [
					c.component('icon', new Txt('', {
						className: 'fas fa-fw fa-lg'
					}))
				])), (_, c) => {
					let icon = c.getNode('icon');
					if (!icon) {
						return;
					}

					if (this.model.mute) {
						icon.removeClass('fa-volume-off');
						icon.addClass('fa-volume-mute');
					} else {
						icon.removeClass('fa-volume-mute');
						icon.addClass('fa-volume-off');
					}
				}))
			]),
			n.elem('div', {
				className: 'volume-button'
			}, [
				n.component(new ModelComponent(this.model, new Elem(c => c.elem('span', {
					className: 'button',
					events: {
						click: (m) => {
							if (m.mute) {
								return;
							}
							this._setVolume(null, 'down');
						}
					}
				}, [
					c.elem('span', {
						className: 'fas fa-fw fa-lg fa-volume-down'
					})
				])), (m, e) => {
					if (m.mute) {
						e.addClass('disabled');
					} else {
						e.removeClass('disabled');
					}
				}))
			]),
			n.elem('div', {
				className: 'volume-slider'
			}, [
				n.component('volume', new ModelInput(this.model, (m, e) => {
					e.setDisabled(m.mute);
					return m.volume.toString();
				}, {
					className: 'slider',
					attributes: {
						type: 'range',
						min: 0,
						max: 100,
						step: 1
					},
					events: {
						input: (_, ev) => {
							this._setVolume(parseInt(ev.target.value));
						}
					}
				}))
			]),
			n.elem('div', {
				className: 'volume-button'
			}, [
				n.component(new ModelComponent(this.model, new Elem(c => c.elem('span', {
					className: 'button',
					events: {
						click: (m) => {
							if (m.mute) {
								return;
							}
							this._setVolume(null, 'up');
						}
					}
				}, [
					c.elem('span', {
						className: 'fas fa-fw fa-lg fa-volume-up'
					})
				])), (m, e) => {
					if (m.mute) {
						e.addClass('disabled');
					} else {
						e.removeClass('disabled');
					}
				}))
			])
		]));

		if (node && component) {
			node.fade(component);
		}
	}

	_setVolume(val, dir) {
		if (this.model.mute) {
			return;
		}

		let new_volume = this.model.volume;

		if (val === null) {
			val = this.params.step;
		}

		if (!dir) {
			new_volume = val;
		} else if (dir === 'up') {
			new_volume += val;
		} else if (dir === 'down') {
			new_volume -= val;
		}

		if (new_volume > 100) {
			new_volume = 100;
		}

		if (new_volume < 0) {
			new_volume = 0;
		}

		this.model.set({
			volume: new_volume
		});
	}

	render(el) {
		this.node = new Elem(n => n.elem("div", {
			className: 'grid-x'
		}, [
			n.elem('div', {
				className: 'cell'
			}, [
				n.component('volume', new Transition())
			])
		]));

		this._setListeners(true);
		this.node.render(el);

		this._load();
	}

	unrender() {
		this._setListeners(false);
		this.node.unrender();
		this.node = null;
	}
}

export default VolumeComponent;