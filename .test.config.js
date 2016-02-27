import 'babel-polyfill';
import jsdom from 'jsdom'

// How to get rid of global JSDom??
// Istanbul does not work if I remove this globals.

global.document = jsdom.jsdom('<html><head><script></script></head><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;

// take all properties of the window object and also attach it to the
// mocha global object
propagateToGlobal(document.defaultView);

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue;
    if (key in global) continue;

    global[key] = window[key];
  }
}
