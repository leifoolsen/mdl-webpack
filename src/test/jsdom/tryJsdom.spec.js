'use strict';
import 'babel-polyfill';
import jsdomify from 'jsdomify';
import { expect } from 'chai';

describe('mocha-jsdom tests', () => {

  before ( () => {
    jsdomify.create('<!doctype html><html><body><div id="content"></div></body></html>');
  });

  beforeEach( () => {
    jsdomify.clear();
  });

  after ( () => {
    jsdomify.destroy()
  }) ;

  it('has document', () => {
    const div = document.createElement('div');
    expect(div.nodeName).eql('DIV');
  });

  it('works', () => {
    const content = document.querySelector('#content');
    expect(content).to.not.be.null;
  });

  it('can render html', () => {
    const greeting = 'Hello, Hola, Hei';
    const p = document.createElement("P");
    const text = document.createTextNode(greeting);
    p.appendChild(text);

    const content = document.querySelector('#content');
    content.appendChild(p);

    const paragraphs = document.querySelectorAll("P");
    expect(document.body.innerHTML).not.to.be.empty;
    expect(paragraphs.length).equal(1);
    expect(paragraphs[0].innerHTML).equal(greeting);
  });

});
