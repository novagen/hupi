import config from '../config';
import Service from '../service';
//import mongo from 'mongodb';

const service = new Service("Media", config.nats);

service.subscribe('db.select.*', function (_, reply) {
	service.publish(reply, Service.success());
});

service.subscribe('db.insert.*', function (_, reply) {
	service.publish(reply, Service.success());
});

service.subscribe('db.update.*', function (_, reply) {
	service.publish(reply, Service.success());
});
