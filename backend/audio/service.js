import config from '../config';
import diff from 'object-diff';
import { Logger } from 'wace-admin-support';
import { Service, Constants } from 'wace-admin-service';
import AsyncPolling from 'async-polling';
import rpio from 'rpio';

const nats = new Service("Audio", Service.getNatsConfig(config)).connect();
const portAudio = require('naudiodon');

let pins = {
	clk: null,
	dt: null,
	sw: null,
	changed: false
};

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
		if (result.changed) {
			getRotaryEvent(result);
		}
	});

	polling.run(); 
};

const doRotaryEncoderPoll = (cb) => {
	if (!cb) {
		throw new Error("Missing callback");
	}

	let changed = false;

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

	pins.changed = changed;
	cb(null, pins);
};

let pinQueue = [];

const getRotaryEvent = (pin) => {
	pinQueue.push(pin);

	if (pinQueue.length > 4) {
		pinQueue.shift();
	}

	if (pinQueue.length == 4) {
		checkForRotation(pinQueue);
	}

	if (pinQueue.length >= 2) {
		checkForClick(pinQueue);
	}
};

const checkForRotation = (queue) => {
	if (queue.length == 4) {
		let clks = queue.map(i => i.clk);
		let dts = queue.map(i => i.dt);

		console.log('rotation', clks, dts);
	}
};

const checkForClick = (queue) => {
	if (queue.length > 1) {
		let pinData = queue.slice(queue.length - 3, queue.length - 1).map(i => i.sw);
		console.log('click', pinData);
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
