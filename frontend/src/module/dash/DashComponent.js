import { Elem, ModuleComponent, Gauge, Container } from 'component';
import { Model } from 'modapp-resource';
import { ModelComponent } from 'modapp-resource-component';
import { ResizeSensor } from 'css-element-queries';

import 'scss/DashModule.scss';

class DashComponent extends ModuleComponent {
	constructor(app, module, params) {
		super('module.dash', module);

		this.app = app;
		this.module = module;
		this.params = params;

		this.view = new Model({
			eventBus: this.app.eventBus,
			namespace: 'module.layout.map.view',
			definition: {
				map: {
					type: 'boolean',
					default: this.params.showMap
				}
			},
			data: {}
		});

		this._loadModels = this._loadModels.bind(this);
		this._renderModels = this._renderModels.bind(this);
		this._resizeContent = this._resizeContent.bind(this);
		this._getMeterSize = this._getMeterSize.bind(this);
		this._createMap = this._createMap.bind(this);

		this.mapIcons = {
			marker: this.module.maps.createMarker({ start_color: '#d6ffc5', end_color: '#0a8300', height: 32, width: 24 }),
			location: this.module.maps.createLocation({ color: '#14679e', height: 24, width: 24 })
		};
	}

	render(el) {
		this.node = new Elem(n => n.component('gauges', new Container({ className: 'dash' })));

		this.node.render(el);
		this._loadModels();

		this.view.on('change', this._viewChanged);
	}

	_viewChanged() {

	}

	_loadModels() {
		const promises = [];

		promises.push(this.module.client.get('dash.speedometer'));
		promises.push(this.module.client.get('dash.tachometer'));

		Promise.all(promises).then(r => {
			this._speedModel = r[0];
			this._tachModel = r[1];

			this._renderModels();
		}).catch(() => {});
	}

	_renderModels() {
		const node = this.node.getNode('gauges');

		const component = new Elem(n => n.elem('div', { className: 'meters' }, [
			n.component('speedometer', new Gauge(this._speedModel, {
				value: m => m.value,
				minValue: m => m.min,
				maxValue: m => m.max,
				units: m => m.units,
				minorTicks: 3,
				stepLength: 30
			})),
			n.component('map', new ModelComponent(this.view, new Elem(m => m.elem('map', 'div', { className: 'map'  })), (m, e) => {
				if (m.map) {
					e.addClass('enabled');
					e.removeClass('disabled');
				} else {
					e.addClass('disabled');
					e.removeClass('enabled');
				}
			})),
			n.component('tachometer', new Gauge(this._tachModel, {
				value: m => m.value,
				minValue: m => m.min,
				maxValue: m => m.max,
				units: m => m.units,
				minorTicks: 10,
				stepLength: 1000
			}))
		]));

		if (node && component) {
			node.set(component);
		}

		this._speedNode = component.getNode('speedometer');
		this._tachNode = component.getNode('tachometer');

		this.resizeSensor = new ResizeSensor(this._speedNode._rootElem.el, this._resizeContent);
		this._createMap(component.getNode('map').ml.component.el);
	}

	_setLocation(center) {
		if (!this.mylocation) {
			this.mylocation = new this.google.maps.Marker({
				clickable: false,
				icon: { url: this.mapIcons.location, scaledSize: new this.google.maps.Size(24, 32) },
				shadow: null,
				zIndex: 999,
				map: this.map
			});
		}

		navigator.geolocation.getCurrentPosition(loc => {
			if (!this.mylocation) { return; }

			this.mylocation.setPosition(new this.google.maps.LatLng(loc.coords.latitude, loc.coords.longitude));

			if (center) {
				this._setCenter({
					lat: () => loc.coords.latitude,
					lng: () => loc.coords.longitude
				});

				this._setZoom(18);
			}
		}, e => {
			console.error(e);
		});
	}

	_setZoom(level) {
		if (!this.map) { return; }
		this.map.setZoom(level);
	}

	_setCenter(location) {
		if (!this.map) { return; }
		this.map.setCenter({ lat: location.lat(), lng: location.lng() });
	}

	_createMap(elem) {
		if (!this.params.showMap) { return; }

		this.module.maps.getGoogle().then(google => {
			this.google = google;
			let options = this.module.maps.getDefaultOptions();

			options.center = {
				lat: 59.2720599,
				lng: 15.2200551
			};

			options.mapTypeControlOptions = {
                position: google.maps.ControlPosition.BOTTOM_CENTER
            };


			this.map = new google.maps.Map(elem, options);

			if (this.params.trackLocation) {
				this.trackInterval = setInterval(() => { this._setLocation(true); }, 1000);
			}
		});
	}

	_getMeterSize(component) {
		if (!this._measureHeightNode) {
			this._measureHeightNode = this.node.getNode('gauges');
		}

		const width = component._rootElem.el.offsetWidth;
		const height = this._measureHeightNode.div.offsetHeight;

		if (width >= height) {
			return height;
		}

		return width;
	}

	_resizeContent() {
		if (!this.node || !this._speedNode || !this._tachNode) { return; }

		const size = this._getMeterSize(this._speedNode);

		this._speedNode.setSize(size, size);
		this._tachNode.setSize(size, size);
	}

	unrender() {
		this.view.off('change', this._viewChanged);

		if (this.resizeSensor) {
			this.resizeSensor.detach();
			this.resizeSensor = null;
		}

		if (this.trackInterval) {
			clearInterval(this.trackInterval);
		}

		if (this.mylocation) {
			this.mylocation.setMap(null);
			delete this.mylocation;
		}

		this._speedNode = null;
		this._tachNode = null;
		this._measureHeightNode = null;

		this.node.unrender();
		this.node = null;
	}
}

export default DashComponent;