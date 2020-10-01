import config from '../config';
import { Service } from 'wace-admin-service';

const nats = new Service("Access", Service.getNatsConfig(config)).connect();

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