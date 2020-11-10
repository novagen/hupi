import config from '../config';
import Service from '../service';
import Gpsd from 'node-gpsd-client';

const service = new Service("Audio", config.nats);

const client = new Gpsd({
	port: 2947,
	hostname: 'localhost',
	autoReconnect: 5,
	parse: true
});

const init = () => {
    client.on('connected', () => {
        console.log('Gpsd connected');

        client.watch({
            class: 'WATCH',
            json: true,
            scaled: true
        });
    });

    client.on('error', err => {
        console.error('Gpsd error', err.message);
    });

    client.connect();
};

const listen = () => {
    client.on('TPV', data => {
        console.log(data);
    });
};

const locationModel = {
	lat: 0,
	lng: 0
};

service.subscribe('get.location.spot', function (_, reply) {
	if (locationModel) {
		service.publish(reply, {
			result: {
				model: locationModel
			}
		});
	} else {
		service.publish(reply, Service.notFound());
	}
});


service.publish('system.reset', { resources: ['location.>'] });

init();
listen();