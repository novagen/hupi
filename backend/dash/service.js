import config from '../config';
import Service from '../service';

const service = new Service("Media", config.nats);

const speedometerModel = {
	value: 0,
	max: 300,
	min: 0,
	units: 'km/h',
	warnFrom: 0
};

const tachometerModel = {
	value: 0,
	max: 8000,
	min: 0,
	units: 'rpm',
	warnFrom: 6000
};

service.subscribe('get.dash.speedometer', function (_, reply) {
	if (speedometerModel) {
		service.publish(reply, {
			result: {
				model: speedometerModel
			}
		});
	} else {
		service.publish(reply, Service.notFound());
	}
});

service.subscribe('get.dash.tachometer', function (_, reply) {
	if (tachometerModel) {
		service.publish(reply, {
			result: {
				model: tachometerModel
			}
		});
	} else {
		service.publish(reply, Service.notFound());
	}
});

service.publish('system.reset', { resources: ['dash.>'] });
