import config from '../config';
import diff from 'object-diff';
import { Logger } from 'wace-admin-support';
import { Service, Constants } from 'wace-admin-service';
import AsyncPolling from 'async-polling';
import rpio from 'rpio';

const nats = new Service("Audio", Service.getNatsConfig(config)).connect();
const portAudio = require('naudiodon');

const volumeModel = {
	volume: 50,
	mute: false
};

const clkUp = [0, 0, 1, 1];
const dtUp = [1, 0, 0, 1];

const clkDown = [1, 0, 0, 1];
const dtDown = [0, 0, 1, 1];

const equals = (current, array) => {
	if (!array) {
		return false;
	}

	if (current.length != array.length) {
		return false;
	}

	for (var i = 0, l = current.length; i < l; i++) {
		if (current[i] instanceof Array && array[i] instanceof Array) {
			if (!current[i].equals(array[i])) {
				return false;
			}
		} else if (current[i] != array[i]) {
			return false;
		}
	}

	return true;
};

const lastPinValues = {
	clk: null,
	dt: null,
	sw: null
};

let pinQueue = [];

const listenOnRotaryEnconder = () => {
	initPins();

	var polling = AsyncPolling((end) => {
		pollEncoder((error, response) => {
			if (error) {
				end(error);
				return;
			}

			end(null, response);
		});
	}, 5);

	polling.on('error', function (error) {
		Logger.error(error);
	});

	polling.on('result', function (result) {
		if (result.changed) {
			let length = pinQueue.push({
				clk: result.clk,
				dt: result.dt,
				sw: result.sw
			});

			if (length > 4) {
				pinQueue.shift();
			}

			getRotaryEvent();
		}
	});

	polling.run();
};

const pollEncoder = (cb) => {
	let changed = false;

	try {
		let clk = rpio.read(11);
		let dt = rpio.read(12);
		let sw = rpio.read(13);

		if (lastPinValues.clk != clk) {
			lastPinValues.clk = clk;
			changed = true;
		}

		if (lastPinValues.dt != dt) {
			lastPinValues.dt = dt;
			changed = true;
		}

		if (lastPinValues.sw != sw) {
			lastPinValues.sw = sw;
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
		let rotation = checkForRotation(pinQueue);
		if (rotation.changed) {
			changeVolume(rotation.direction);
			clearQueue();
			return;
		}
	}

	if (pinQueue.length >= 2) {
		if (checkForClick(pinQueue)) {
			toggleMute();
			clearQueue();
			return;
		}
	}
};

const clearQueue = () => {
	pinQueue = [];
};

const checkForRotation = (queue) => {
	if (queue.length == 4) {
		let clks = queue.map(i => i.clk);
		let dts = queue.map(i => i.dt);

		let changed = false;
		let direction = 'none';

		if (equals(clks, clkUp) && equals(dts, dtUp)) {
			changed = true;
			direction = 'up';
		}

		if (equals(clks, clkDown) && equals(dts, dtDown)) {
			changed = true;
			direction = 'down';
		}

		return {
			changed,
			direction
		};
	}
};

const checkForClick = (queue) => {
	if (queue.length > 1) {
		let pinData = queue.slice(queue.length - 3, queue.length - 1).map(i => i.sw);

		// Ignored key down.
		// if (equals(pinData, [1, 0])) {
		// 	return true;
		// }

		if (equals(pinData, [0, 1])) {
			return true;
		}

		return false;
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
		} catch (e) {
			reject(e);
		}
	});
};

const sendListReply = (res, reply) => {
	var result = [];

	for (const m of res) {
		result.push({
			rid: "audio.device." + m.id
		});
	}

	nats.publish(reply, JSON.stringify({
		result: {
			collection: result
		}
	}));
};

const getAudioDevices = () => {
	const devices = portAudio.getDevices().filter(i => i.maxOutputChannels > 0);
	return devices;
};

const toggleMute = () => {
	let muted = {
		mute : !volumeModel.mute
	};

	const changed = diff(volumeModel, muted);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	}
};

const changeVolume = (dir) => {
	let new_volume = volumeModel.volume;
	let val = 5;

	if (dir === 'up') {
		if (new_volume + val <= 100) {
			new_volume += val;
		} else {
			new_volume = 100;
		}
	} else if (dir === 'down') {
		if (new_volume - val >= 0) {
			new_volume -= val;
		} else {
			new_volume = 0;
		}
	} else {
		return;
	}

	let volume = {
		volume : new_volume
	};

	const changed = diff(volumeModel, volume);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	}	
};

nats.subscribe('get.audio.device.*', function (_, reply, subj) {
	let id = subj.substring(17);

	getAudioModel(id).then(model => {
		if (model) {
			nats.publish(reply, JSON.stringify({
				result: {
					model
				}
			}));
		} else {
			nats.publish(reply, Constants.notFound);
		}
	}).catch(e => {
		Logger.Error(e);
		nats.publish(reply, Constants.internalError(JSON.stringify(e)));
	});
});

nats.subscribe('call.audio.volume.set', (req, reply) => {
	const params = JSON.parse(req);
	const changed = diff(volumeModel, params.params);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		nats.publish(reply, Constants.success);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	} else {
		nats.publish(reply, Constants.success);
	}
});

nats.subscribe('get.audio.volume', function (_, reply) {
	if (volumeModel) {
		nats.publish(reply, JSON.stringify({
			result: {
				model: volumeModel
			}
		}));
	} else {
		nats.publish(reply, Constants.notFound);
	}
});

nats.subscribe('get.audio.devices', function (_, reply) {
	try {
		const devices = getAudioDevices();
		sendListReply(devices, reply);
	} catch (err) {
		Logger.Error(err);
		nats.publish(reply, Constants.internalError(JSON.stringify(err)));
		
		return;
	}
});

nats.publish('system.reset', JSON.stringify({ resources: ['audio.>'] }));
listenOnRotaryEnconder();