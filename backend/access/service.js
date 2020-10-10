import config from '../config';
import Service from '../service';

const service = new Service("Access", config.nats);

service.subscribe('access.system.translation.>', (_, reply) => {
	service.publish(reply, {
		result: {
			get: true,
			call: "*"
		}
	});
});

service.subscribe('access.audio.>', (_, reply) => {
	service.publish(reply, {
		result: {
			get: true,
			call: "*"
		}
	});
});

service.publish('system.reset', { resources: [ 'access.>' ] });