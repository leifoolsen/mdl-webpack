'use strict';
import 'babel-polyfill';
import { expect } from 'chai';
import jsdom from 'jsdom'

describe('mocha-jsdom tests', function () {

  let document = jsdom.jsdom();

  it('has document', () => {
    const div = document.createElement('div')
    expect(div.nodeName).eql('DIV')
  })

  it('works', () => {
    document.body.innerHTML = '<div>hola</div>'
    const div = document.getElementsByTagName('div')[0]
    expect(div.innerHTML).eql('hola')
  })

})
