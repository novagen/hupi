import config from '../config';
import Service from '../service';
import Gpsd from 'node-gpsd-client';
import diff from 'object-diff';

const service = new Service("Audio", config.nats);

const client = new Gpsd({
	port: 2947,
	hostname: 'localhost',
	autoReconnect: 5,
	parse: true
});

const locationModel = {
	time: '',
	ept: 0,
	lat: 0,
	lon: 0,
	alt: 0,
	epx: 0,
	epy: 0,
	epv: 0,
	track: 0,
	speed: 0,
	climb: 0
};

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
        const val = {
            time: data.time,
            ept: data.ept,
            lat: data.lat,
            lon: data.lon,
            alt: data.alt,
            epx: data.epx,
            epy: data.epy,
            epv: data.epv,
            track: data.track,
            speed: data.speed,
            climb: data.climb
        };

        const changed = diff(locationModel, val);

        if (changed && Object.keys(changed).length) {
            Object.assign(locationModel, changed);

            service.publish("event.location.spot.change", {
                values: changed
            });
        }
    });
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