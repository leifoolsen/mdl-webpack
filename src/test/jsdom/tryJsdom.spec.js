'use strict';
import 'babel-polyfill';
import jsdomify from 'jsdomify';
import { expect } from 'chai';

describe('mocha-jsdom tests', () => {

  before ( () => {
    jsdomify.create()
  })

  after ( () => {
    jsdomify.destroy()
  })

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
