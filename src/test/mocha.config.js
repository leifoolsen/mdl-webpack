import 'babel-polyfill';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import jsdom from 'jsdom';

chai.use(sinonChai);
chai.use(chaiAsPromised);

global.sinon = sinon;
global.expect = chai.expect;

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
