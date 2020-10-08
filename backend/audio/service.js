import config from '../config';
import diff from 'object-diff';
import { Logger } from 'wace-admin-support';
import { Service, Constants } from 'wace-admin-service';
import AsyncPolling from 'async-polling';
import rpio from 'rpio';

// Warn if overriding existing method
if (Array.prototype.equals) {
	console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = (array) => {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length){
		return false;
	}

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i])) {
				return false;
			}
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
};

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

const nats = new Service("Audio", Service.getNatsConfig(config)).connect();
const portAudio = require('naudiodon');

let pins = {
	clk: null,
	dt: null,
	sw: null
};

let pinQueue = [];

const listenOnRotaryEnconder = () => {
	initPins();

	var polling = AsyncPolling((end) => {
		doRotaryEncoderPoll((error, response) => {
			if (error) {
				end(error);
				return;
			}

			end(null, response);
		});
	}, 10);

	polling.on('error', function (error) {
		console.log(error);
	});

	polling.on('result', function (result) {
		// ignore if no changes occurred
		if (result.changed) {
			// add last changes to the queue
			let length = pinQueue.push({
				clk: result.clk,
				dt: result.dt,
				sw: result.sw
			});

			// make sure the queue is never longer than 4
			if (length > 4) {
				pinQueue.shift();
			}

			// check for events
			getRotaryEvent();
		}
	});

	polling.run(); 
};

const doRotaryEncoderPoll = (cb) => {
	let changed = false;

	try {
		let clk = rpio.read(11);
		let dt = rpio.read(12);
		let sw = rpio.read(13);

		if (pins.clk != clk) {
			pins.clk = clk;
			changed = true;
		}

		if (pins.dt != dt) {
			pins.dt = dt;
			changed = true;
		}

		if (pins.sw != sw) {
			pins.sw = sw;
			changed = true;
		}

		let response = {
			clk,
			dt,
			sw,
			changed
		};

		cb(null, response);
	} catch (e) {
		cb(e, null);
	}
};

const getRotaryEvent = () => {
	if (pinQueue.length == 4) {
		checkForRotation(pinQueue);
	}

	if (pinQueue.length >= 2) {
		checkForClick(pinQueue);
	}
};

const clkUp = [ 0, 0, 1, 1 ];
const dtUp = [ 1, 0, 0, 1 ];

const clkDown = [ 1, 0, 0, 1 ];
const dtDown = [ 0, 0, 1, 1 ];

const checkForRotation = (queue) => {
	if (queue.length == 4) {
		let clks = queue.map(i => i.clk);
		let dts = queue.map(i => i.dt);

		if (clks.equals(clkUp) && dts.equals(dtUp)) {
			console.log('rotation up');
			return;
		}

		if (clks.equals(clkDown) && dts.equals(dtDown)) {
			console.log('rotation down');
			return;
		}
	}
};

const checkForClick = (queue) => {
	if (queue.length > 1) {
		let pinData = queue.slice(queue.length - 3, queue.length - 1).map(i => i.sw);

		if (pinData,equals([ 1, 0 ])) {
			console.log('click up');
			return;
		}

		if (pinData.equals([ 0, 1 ])) {
			console.log('click down');
			return;
		}
	}
};

const initPins = () => {
	rpio.open(11, rpio.INPUT);
	rpio.open(12, rpio.INPUT);
	rpio.open(13, rpio.INPUT);
};

const getAudioModel = id => {
	return new Promise((resolve, reject) => {
		try {
			let model = getAudioDevices().find(i => i.id == id);
			resolve(model);
		} catch(e) {
			reject(e);
		}
	});
};

const sendListReply = (res, reply) => {
	var result = [];

	for (const m of res) {
		result.push({ rid: "audio.device." + m.id });
	}

	nats.publish(reply, JSON.stringify({ result: { collection: result }}));
};

const getAudioDevices = () => {
	const devices = portAudio.getDevices().filter(i => i.maxOutputChannels > 0);
	return devices;
};

nats.subscribe('get.audio.device.*', function (_, reply, subj) {
	let id = subj.substring(17);

	getAudioModel(id).then(model => {
		if (model) {
			nats.publish(reply, JSON.stringify({ result: { model } }));
		} else {
			nats.publish(reply, Constants.notFound);
		}
	}).catch(e => {
		Logger.Error(e);
		nats.publish(reply, Constants.internalError(JSON.stringify(e)));
	});
});

const volumeModel = {
	volume: 50,
	mute: false
};

nats.subscribe('call.audio.volume.set', (req, reply) => {
	const params = JSON.parse(req);
	const changed = diff(volumeModel, params.params);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		nats.publish(reply, Constants.success);
		nats.publish("event.audio.volume.change", JSON.stringify({ values: changed }));
	} else {
		nats.publish(reply, Constants.success);
	}
});

nats.subscribe('get.audio.volume', function (_, reply) {
	if (volumeModel) {
		nats.publish(reply, JSON.stringify({ result: { model: volumeModel } }));
	} else {
		nats.publish(reply, Constants.notFound);
	}
});

nats.subscribe('get.audio.devices', function(_, reply) {
	try {
		const devices = getAudioDevices();
		sendListReply(devices, reply);
	} catch(err) {
		Logger.Error(err);
		nats.publish(reply, Constants.internalError(JSON.stringify(err)));
		return;
	}
});

nats.publish('system.reset', JSON.stringify({ resources: [ 'audio.>' ] }));
listenOnRotaryEnconder();
