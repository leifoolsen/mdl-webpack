/*
 * Copied from https://github.com/fand/EventEmitterDecorator
 * Could not get this to work with npm install.
 */

import { EventEmitter } from 'events';

const methods = [
  'addListener',
  'emit',
  'listeners',
  'on',
  'once',
  'removeAllListeners',
  'removeListener',
  'setMaxListeners',
  'getMaxListeners'
];

// Get or create eventemitter for current instance
const emitters = new WeakMap();
const getEmitter = function (obj) {
  let emitter = emitters.get(obj);
  if (!emitter) {
    emitter = new EventEmitter();
    emitters.set(obj, emitter);
  }
  return emitter;
};

export default function EventEmitterDecorator (klass) {

  methods.forEach((method) => {
    if (klass.prototype[method]) {
      throw new Error(`"${method}" method is already defined!`);
    }

    if (! EventEmitter.prototype[method]) { return; }
    klass.prototype[method] = function () {
      const emitter = getEmitter(this);
      return emitter[method].apply(emitter, arguments); //eslint-disable-line
    };
  });
}
