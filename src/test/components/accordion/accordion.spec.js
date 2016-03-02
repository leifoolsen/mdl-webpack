'use strict';
import 'babel-polyfill';
import jsdomify from 'jsdomify';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { qs, qsa } from '../../../js/utils/domHelpers';

describe('Accordion', () => {
  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Accordion Fixture</title>
</head>
<body>
<div id='mount'>

<div class="a-user-defined-accordion-container" style="height: 250px;">

  <ul id="horisontal-accordion" class="mdlext-accordion" role="tablist" aria-multiselectable="false">
    <li class="mdlext-accordion__panel" open >
      <header class="mdlext-accordion__panel__title">
        <a href="#"></a>
        <div class="mdlext-accordion__panel__title__transform">
          <h5>First section</h5>
        </div>
      </header>
      <section class="mdlext-accordion__panel__content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tristique eget augue eget gravida.</p>
        <p>Maecenas eu vestibulum orci. Ut eget nisi a est sagittis euismod a vel.</p>
      </section>
    </li>
    <li class="mdlext-accordion__panel">
      <header class="mdlext-accordion__panel__title">
        <a href="#"></a>
        <div class="mdlext-accordion__panel__title__transform">
          <h5>Second</h5>
        </div>
      </header>
      <section class="mdlext-accordion__panel__content">
        <p>Maecenas eu vestibulum orci. Ut eget nisi a est sagittis euismod a vel
          justo. Quisque at dui urna. Duis vel velit leo.</p>
      </section>
    </li>
    <li class="mdlext-accordion__panel">
      <header class="mdlext-accordion__panel__title">
        <a href="#"></a>
        <div class="mdlext-accordion__panel__title__transform">
          <h5>Section #3</h5>
        </div>
      </header>
      <section class="mdlext-accordion__panel__content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </section>
    </li>
    <li class="mdlext-accordion__panel">
      <header class="mdlext-accordion__panel__title">
        <a href="#"></a>
        <div class="mdlext-accordion__panel__title__transform">
          <h5>Fourth section</h5>
        </div>
      </header>
      <section class="mdlext-accordion__panel__content">
        <p>Maecenas eu vestibulum orci. Ut eget nisi a est sagittis euismod a vel.</p>
      </section>
    </li>
    <li class="mdlext-accordion__panel">
      <header class="mdlext-accordion__panel__title">
        <a href="#"></a>
        <div class="mdlext-accordion__panel__title__transform">
          <h5>Fifth</h5>
        </div>
      </header>
      <section class="mdlext-accordion__panel__content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tristique eget augue eget gravida.</p>
      </section>
    </li>
  </ul>
</div>
</div>
</body>
</html>`;

  const VK_TAB = 9;
  const VK_ENTER = 13;
  const VK_SPACE = 32;
  const VK_END = 35;
  const VK_HOME = 36;
  const VK_ARROW_LEFT = 37;
  const VK_ARROW_UP = 38;
  const VK_ARROW_RIGHT = 39;
  const VK_ARROW_DOWN = 40;

  let Accordion;

  before ( () => {
    jsdomify.create(fixture);

    // Must load accordion after jsdom
    Accordion = require('../../../js/components/accordion/accordion');
    // Do I need this? "Waiting for content to be loaded in jsdom", see: https://gist.github.com/chad3814/5059671

    Accordion.initAccordions();
  });

  after ( () => {
    jsdomify.destroy()
  });

  it('upgrades successfully', () => {
    const accordion = qs('#horisontal-accordion');
    assert.isNotNull(accordion);
    assert.isTrue(accordion.classList.contains('is-upgraded'));
  });

  it('has attribute role="tablist"', () => {
    [...qsa('.mdlext-accordion')].forEach( accordion => {
      assert.equal(accordion.getAttribute('role'), 'tablist');
    });
  });

  it('has panels with role="tabpanel"', () => {
    [...qsa('.mdlext-accordion__panel')].forEach( panel => {
      assert.equal(panel.getAttribute('role'), 'tabpanel');
    });
  });

  it('has headers with role="tab"', () => {
    [...qsa('.mdlext-accordion__panel__title')].forEach( header => {
      assert.equal(header.getAttribute('role'), 'tab');
    });
  });

  it('has one open panel with attribute "open" and a header with attribute "aria-expanded"', () => {
    const panel = qs('#horisontal-accordion .mdlext-accordion__panel[open]');
    assert.isNotNull(panel, 'Expected tabpanel with attribute "open"');

    const title = [...panel.children].find( n => {
      n.classList.contains('mdlext-accordion__panel__title') && n.hasAttribute('aria-expanded');
    });
    assert.isNotNull(title, 'Expected header with attribute "aria-expanded"');
  });

  it('interacts with the keyboard', () => {
    const header = qs('#horisontal-accordion .mdlext-accordion__panel:nth-child(3) .mdlext-accordion__panel__title');
    assert.isNotNull(header, 'Expected handle to panel 3 of 5');

    spyOnKeyboardEvent(header, VK_ARROW_DOWN);
    spyOnKeyboardEvent(header, VK_ARROW_LEFT);
    spyOnKeyboardEvent(header, VK_ARROW_RIGHT);
    spyOnKeyboardEvent(header, VK_ARROW_UP);
    spyOnKeyboardEvent(header, VK_END);
    spyOnKeyboardEvent(header, VK_ENTER);
    spyOnKeyboardEvent(header, VK_HOME);
    spyOnKeyboardEvent(header, VK_SPACE);
    spyOnKeyboardEvent(header, VK_TAB);
  });

  it('emits a click event', () => {
    const header = qs('#horisontal-accordion .mdlext-accordion__panel .mdlext-accordion__panel__title');
    assert.isNotNull(header, 'Expected handle to panel');

    let spy = sinon.spy();
    header.addEventListener('click', spy);

    // Trigger mouse click
    const evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    header.dispatchEvent(evt);

    assert.isTrue(spy.calledOnce, `Expected "click" to fire once`);
    header.removeEventListener('click', spy);
  });

  it('emits a click event when toggled via enter key', () => {
    const header = qs('#horisontal-accordion .mdlext-accordion__panel .mdlext-accordion__panel__title');
    assert.isNotNull(header, 'Expected handle to panel');

    let spy = sinon.spy();
    header.addEventListener('click', spy);
    spyOnKeyboardEvent(header, VK_ENTER);
    assert.isTrue(spy.calledOnce, `Expected "click" to fire once`);
    header.removeEventListener('click', spy);
  });

  it('emits a click event when toggled via space key', () => {
    const header = qs('#horisontal-accordion .mdlext-accordion__panel .mdlext-accordion__panel__title');
    assert.isNotNull(header, 'Expected handle to panel');

    let spy = sinon.spy();
    header.addEventListener('click', spy);
    spyOnKeyboardEvent(header, VK_SPACE);
    assert.isTrue(spy.calledOnce, `Expected "click" to fire once`);
    header.removeEventListener('click', spy);
  });

  it('closes other panels when a new panel opens', () => {
    const header = qs('#horisontal-accordion .mdlext-accordion__panel:nth-child(4) .mdlext-accordion__panel__title');
    assert.isNotNull(header, 'Expected handle to panel 4 of 5');

    const panel = header.parentNode;
    if(panel.hasAttribute('open')) {
      panel.removeAttribute('open');
      header.removeAttribute('aria-expanded');
    }
    // Trigger click
    const evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    header.dispatchEvent(evt);

    assert.isTrue(panel.hasAttribute('open'));
    assert.isTrue(header.hasAttribute('aria-expanded'));

    const check = qsa('#horisontal-accordion .mdlext-accordion__panel[open]');
    assert.lengthOf(check, 1);

  });

  function spyOnKeyboardEvent(target, keyCode) {
    let spy = sinon.spy();
    target.addEventListener('keydown', spy);

    var event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      keyCode : keyCode
    });
    target.dispatchEvent(event);
    target.removeEventListener(name, spy);
    assert.isTrue(spy.calledOnce, `Expected "keydown" event to fire once for key ${keyCode}`);
  }
});
