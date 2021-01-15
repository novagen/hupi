import config from '../config';
import Service from '../service';

const service = new Service("Rfid", config.nats);
var rfid = require('node-rfid');

const init = () => {
    rfid.read(function(e, result) {
         if(e) {
             service.e(e);
         }

         service.log(result);
    });
};

service.publish('system.reset', { resources: ['rfid.>'] });

init();
