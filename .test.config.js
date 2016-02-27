import 'babel-polyfill';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
import jsdom from 'jsdom'

chai.use(sinonChai);
chai.use(chaiAsPromised);

// WTF!! Globas? Really! This stinks.
global.sinon = sinon;

global.expect = chai.expect;
global.expect();             // Tell chai that we'll be using the "expect" style assertions

// I prefer expect
//global.should = chai.should;
//global.should();             // Tell chai that we'll be using the "should" style assertions


// Define some html to be our basic document
// JSDOM will consume this and act as if we were in a browser
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
