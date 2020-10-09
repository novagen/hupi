import config from '../config';
import Service from '../service';

const nats = new Service("Access", config.nats).connect();

nats.subscribe('access.system.translation.>', (_, reply) => {
	nats.publish(reply, JSON.stringify({
		result: {
			get: true,
			call: "*"
		}
	}));
});

nats.subscribe('access.audio.>', (_, reply) => {
	nats.publish(reply, JSON.stringify({
		result: {
			get: true,
			call: "*"
		}
	}));
});

nats.publish('system.reset', JSON.stringify({ resources: [ 'access.>' ] }));