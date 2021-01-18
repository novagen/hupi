// import AsyncPolling from 'async-polling';
// import rpio from 'rpio';

var raspi = require('raspi');
var RotaryEncoder = require('raspi-rotary-encoder').RotaryEncoder;

const events = require('events');
const util = require('util');

const clkUp = [0, 0, 1, 1];
const dtUp = [1, 0, 0, 1];
const clkDown = [1, 0, 0, 1];
const dtDown = [0, 0, 1, 1];

const clkPin = 11;
const dtPin = 15;
const swPin = 13;
const pollingInterval = 2;

class RotaryReader {
    constructor(opt) {
        this.opt = Object.assign({
			onRotation: () => {},
            onClick: () => {},
            clkPin: clkPin,
            dtPin: dtPin,
            swPin: swPin,
            pollingInterval: pollingInterval
		}, opt);

        this.lastPinValues = {
            clk: null,
            dt: null,
            sw: null
        };

        this.rotationQueue = [];
        this.clickQueue = [];

        events.EventEmitter.call(this);

        this.ready = false;
        this.initPins();
	}

    start() {
        // this.polling = AsyncPolling((end) => {
        //     this.pollEncoder((error, response) => {
        //         if (error) {
        //             end(error);
        //             return;
        //         }

        //         end(null, response);
        //     });
        // }, this.opt.pollingInterval);

        // this.polling.on('error', (error) => {
        //     this.emit('error', error);
        // });

        // this.polling.on('result', (result) => {
        //     if (result.changed) {
        //         this.addRotationQueue(result);
        //         this.addClickQueue(result);

        //         this.getRotaryEvent();
        //     }
        // });

        // this.polling.run();

        this.encoder.addListener('change', function (evt) {
            console.log('Count', evt.value);
        });
    }

    // pollEncoder(callback) {
    //     let changed = false;

    //     try {
    //         let clk = rpio.read(this.opt.clkPin);
    //         let dt = rpio.read(this.opt.dtPin);
    //         let sw = rpio.read(this.opt.swPin);

    //         if (this.lastPinValues.clk != clk) {
    //             this.lastPinValues.clk = clk;
    //             changed = true;
    //         }

    //         if (this.lastPinValues.dt != dt) {
    //             this.lastPinValues.dt = dt;
    //             changed = true;
    //         }

    //         if (this.lastPinValues.sw != sw) {
    //             this.lastPinValues.sw = sw;
    //             changed = true;
    //         }

    //         let response = {
    //             clk,
    //             dt,
    //             sw,
    //             changed
    //         };

    //         callback(null, response);
    //     } catch (e) {
    //         this.emit('error', e);
    //         callback(e, null);
    //     }
    // }

    getRotaryEvent() {
        let rotation = this.checkForRotation();

        if (rotation.changed) {
            this.clearRotationQueue();
            this.opt.onRotation(rotation.direction);
            return;
        }

        if (this.checkForClick()) {
            this.clearClickQueue();
            this.opt.onClick();
            return;
        }
    }

    addRotationQueue(item) {
        let length = this.rotationQueue.push({
            clk: item.clk,
            dt: item.dt
        });

        if (length > 4) {
            this.rotationQueue.shift();
        }
    }

    addClickQueue(item) {
        let length = this.clickQueue.push({
            sw: item.sw
        });

        if (length > 2) {
            this.clickQueue.shift();
        }
    }

    clearRotationQueue() {
        this.rotationQueue = [];
    }

    clearClickQueue() {
        this.rotationQueue = [];
    }

    checkForRotation() {
        const queue = this.rotationQueue.slice();

        let changed = false;
        let direction = 'none';

        if (queue.length == 4) {
            let clks = queue.map(i => i.clk);
            let dts = queue.map(i => i.dt);

            if (this.equals(clks, clkUp) && this.equals(dts, dtUp)) {
                changed = true;
                direction = 'up';
            }

            if (this.equals(clks, clkDown) && this.equals(dts, dtDown)) {
                changed = true;
                direction = 'down';
            }
        }

        return {
            changed,
            direction
        };
    }

    checkForClick() {
        const queue = this.clickQueue.slice();

        if (queue.length == 2) {
            let pinData = queue.map(i => i.sw);

            if (this.equals(pinData, [0, 1])) {
                return true;
            }
        }

        return false;
    }

    equals(current, array) {
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
    }

    isReady() {
        return this.ready;
    }

    initPins() {
        // rpio.init({
        //     gpiomem: true,
        //     mapping: 'physical'
        // });

        // try {
        //     rpio.open(this.opt.clkPin, rpio.INPUT);
        //     rpio.open(this.opt.dtPin, rpio.INPUT);
        //     rpio.open(this.opt.swPin, rpio.INPUT);
        // } catch (e) {
        //     this.emit('error', e);
        // }

        raspi.init(function() {
            this.encoder = new RotaryEncoder({
                pins: { a: this.opt.clkPin, b: this.opt.dtPin },
                pullResistors: { a: 'up', b: 'up' }
            });

            this.ready = true;
            this.emit('ready', this);
        });
    }
}

util.inherits(RotaryReader, events.EventEmitter);

export default RotaryReader;