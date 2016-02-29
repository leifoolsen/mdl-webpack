'use strict';
import 'babel-polyfill';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import { expect } from 'chai';

describe('MaterialExtSelectfield', () => {

  before ( () => {
    jsdomify.create();

    requireUncached( 'material-design-lite/material');  // See: https://github.com/mochajs/mocha/issues/1722
    requireUncached( '../../../js/components/select/selectfield' );
    global.componentHandler = window.componentHandler;
    global.componentHandler.upgradeAllRegistered();

    console.log('componentHandler', global.componentHandler);
  });

  after ( () => {
    jsdomify.destroy()
  });

  it('should be globally available', () => {
    expect(componentHandler).to.be.a('object');
    //expect(MaterialExtSelectfield).to.be.a('function');
  });

});
