'use strict';
import 'babel-polyfill';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { removeChilds } from '../../js/utils/domHelpers';

describe('MaterialExtCarousel', () => {

  const VK_TAB         = 9;
  const VK_ENTER       = 13;
  const VK_ESC         = 27;
  const VK_SPACE       = 32;
  const VK_PAGE_UP     = 33;
  const VK_PAGE_DOWN   = 34;
  const VK_END         = 35;
  const VK_HOME        = 36;
  const VK_ARROW_LEFT  = 37;
  const VK_ARROW_UP    = 38;
  const VK_ARROW_RIGHT = 39;
  const VK_ARROW_DOWN  = 40;


  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Carousel Fixture</title>
</head>
<body>
<div id='mount'>
  <ul class="mdlext-carousel mdlext-js-carousel">
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
  </ul>

  <ul id="carousel-1" class="mdlext-carousel mdlext-js-carousel">
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
    <li class="mdlext-carousel__slide">
      <figure>
        <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
      </figure>
    </li>
  </ul>
  
</div>
<div id='mount-2'>
</div>
</body>
</html>`;

  const fragment = `
<ul id="carousel-2" class="mdlext-carousel mdlext-js-carousel mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events">
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
  <li class="mdlext-carousel__slide">
    <figure>
      <img src="./smiley.jpg" alt="smiley" title="Smile :-)"/>
    </figure>
  </li>
</ul>`;

  before ( () => {
    jsdomify.create(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    assert.isObject(componentHandler, 'Expected a global MDL component handler');

    requireUncached('../../js/carousel/carousel');
    assert.isNotNull(window.MaterialExtCarousel, 'Expected MaterialExtCarousel not to be null');
    global.MaterialExtCarousel = window.MaterialExtCarousel;
  });

  after ( () => {
    jsdomify.destroy();
  });

  it('is globally available', () => {
    assert.isFunction(window['MaterialExtCarousel'], 'Expected global MaterialExtCarousel');
  });

  it('should have css class "is-upgraded"', () => {
    const element = document.querySelector('#carousel-1');
    assert.isNotNull(element);
    assert.isTrue(element.classList.contains('is-upgraded'), 'Expected class "is-upgraded" to exist');
  });


  it('should have attribute "data-upgraded"', () => {
    const dataUpgraded = document.querySelector('#carousel-1').getAttribute('data-upgraded');
    assert.isNotNull(dataUpgraded, 'Expected MaterialExtCarousel to have "data-upgraded" attribute');
    assert.isAtLeast(dataUpgraded.indexOf('MaterialExtCarousel'), 0, 'Expected "data-upgraded" attribute to contain "MaterialExtCarousel"');
  });


  it('upgrades successfully when a new component is appended to the DOM', () => {
    const container = document.querySelector('#mount-2');
    container.insertAdjacentHTML('beforeend', fragment);

    try {
      const element = document.querySelector('#carousel-2');
      assert.isFalse(element.classList.contains('is-upgraded'), 'Expected class "is-upgraded" to not exist before upgrade');

      componentHandler.upgradeElement(element, 'MaterialExtCarousel');

      assert.isTrue(element.classList.contains('is-upgraded'), 'Expected carousel to upgrade');

      const dataUpgraded = element.getAttribute('data-upgraded');
      assert.isNotNull(dataUpgraded, 'Expected MaterialExtCarousel to have "data-upgraded" attribute');
      assert.isAtLeast(dataUpgraded.indexOf('MaterialExtCarousel'), 0, 'Expected "data-upgraded" attribute to contain "MaterialExtCarousel"');
    }
    finally {
      removeChilds(container);
    }
  });

  it('downgrades successfully when a component is removed from DOM', () => {
    const container = document.getElementById('mount-2');
    container.insertAdjacentHTML('beforeend', fragment);

    try {
      const element = document.querySelector('#carousel-2');
      componentHandler.upgradeElement(element, 'MaterialExtCarousel');
      expect(element.getAttribute('data-upgraded')).to.include('MaterialExtCarousel');

      componentHandler.downgradeElements(element);
      expect(element.getAttribute('data-upgraded')).to.not.include('MaterialExtCarousel');
    }
    finally {
      removeChilds(container);
    }
  });

  it('should be a widget', () => {
    const container = document.getElementById('mount-2');
    container.insertAdjacentHTML('beforeend', fragment);

    try {
      const element = document.querySelector('#carousel-2');
      componentHandler.upgradeElement(element, 'MaterialExtCarousel');
      expect(element.MaterialExtCarousel).to.be.a('object');
    }
    finally {
      removeChilds(container);
    }
  });


  // role=list, A section containing listitem elements.
  it('has role="list"', () => {
    [...document.querySelectorAll('.mdlext-carousel')].forEach( carousel => {
      assert.equal(carousel.getAttribute('role'), 'list', 'Expected carousel to have role="list"');
    });
  });


  // role=listitem, A single item in a list or directory.
  it('has slides with role="listitem"', () => {
    [...document.querySelectorAll('.mdlext-carousel__slide')].forEach( slide => {
      assert.equal(slide.getAttribute('role'), 'listitem', 'Expected slide to have role="listitem"');
    });

  });


  it('should have public methods available via widget', () => {
    const el = document.querySelector('.mdlext-carousel');
    const methods = [
      'stopAnimation',
      'upgradeSlides',
      'getConfig'
    ];
    methods.forEach((method) => {
      expect(el.MaterialExtCarousel[method]).to.be.a('function');
    });
  });

  it('can call public methodes', () => {
    const el = document.querySelector('.mdlext-carousel');
    el.MaterialExtCarousel.stopAnimation();
    el.MaterialExtCarousel.upgradeSlides();
    el.MaterialExtCarousel.getConfig();
  });

  it('has ripple effect', () => {
    const container = document.querySelector('#mount-2');
    try {
      container.insertAdjacentHTML('beforeend', fragment);
      const element = document.querySelector('#carousel-2');
      componentHandler.upgradeDom();

      const dataUpgraded = element.getAttribute('data-upgraded');
      assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
      assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');

      [...document.querySelectorAll('#mount-2 mdlext-carousel__slide')].forEach( slide => {

        const ripple = slide.querySelector('.mdlext-carousel__slide__ripple-container');
        assert.isNotNull(ripple, 'Expected ripple to exist');

        const dataUpgraded = ripple.getAttribute('data-upgraded');
        assert.isNotNull(dataUpgraded, 'Expected attribute "data-upgraded" to exist');
        assert.isAtLeast(dataUpgraded.indexOf('MaterialRipple'), 0, 'Expected "data-upgraded" attribute to contain "MaterialRipple');
      });
    }
    finally {
      removeChilds(container);
    }
  });


  it('interacts with the keyboard', () => {
    const carousel = document.querySelector('.mdlext-carousel');

    spyOnKeyboardEvent(carousel, VK_ARROW_DOWN);
    spyOnKeyboardEvent(carousel, VK_ARROW_UP);
    spyOnKeyboardEvent(carousel, VK_ARROW_LEFT);
    spyOnKeyboardEvent(carousel, VK_ARROW_RIGHT);
    spyOnKeyboardEvent(carousel, VK_END);
    spyOnKeyboardEvent(carousel, VK_HOME);
    spyOnKeyboardEvent(carousel, VK_ESC);
    spyOnKeyboardEvent(carousel, VK_SPACE);
    spyOnKeyboardEvent(carousel, VK_TAB);
    spyOnKeyboardEvent(carousel, VK_TAB, true);
    spyOnKeyboardEvent(carousel, VK_ENTER);
    spyOnKeyboardEvent(carousel, VK_PAGE_DOWN);
    spyOnKeyboardEvent(carousel, VK_PAGE_UP);
  });


  it('disables click on image', () => {
    const carousel = document.querySelector('.mdlext-carousel');
    const img = carousel.querySelector('img');

    const spy = sinon.spy();
    img.addEventListener('click', spy);

    const event = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });

    try {
      img.dispatchEvent(event);
    }
    finally {
      img.removeEventListener('click', spy);
    }
    assert.isTrue(spy.called, 'Expected "click" event to fire when image is clicked');
    assert.isTrue(event.defaultPrevented, 'Expected "event.preventDefault" to be called when image is clicked');
  });


  it('can drag an image', () => {
    const carousel = document.querySelector('.mdlext-carousel');
    const img = carousel.querySelector('img');
    img.src = './smiley.jpg';

    const mouseDownSpy = sinon.spy();
    img.addEventListener('mousedown', mouseDownSpy, true);

    const mouseMoveSpy = sinon.spy();
    window.addEventListener('mousemove', mouseMoveSpy, true);

    const mouseUpSpy = sinon.spy();
    window.addEventListener('mouseup', mouseUpSpy, true);

    try {
      let event = new MouseEvent('mousedown', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 10, // clientX/clientY is readonly...
        'clientY': 0   // ... not shure if I can test mouse movement
      });
      img.dispatchEvent(event);

      event = new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 20,
        'clientY': 0
      });
      window.dispatchEvent(event);

      event = new MouseEvent('mouseup', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': 40,
        'clientY': 0
      });
      window.dispatchEvent(event);
    }
    finally {
      img.removeEventListener('mousedown', mouseDownSpy);
      window.removeEventListener('mousemove', mouseMoveSpy);
      window.removeEventListener('mouseup', mouseUpSpy);
    }
    assert.isTrue(mouseDownSpy.called, 'Expected "mousedown" event to fire');
    assert.isTrue(mouseMoveSpy.called, 'Expected "mousemove" event to fire');
    assert.isTrue(mouseUpSpy.called, 'Expected "mouseup" event to fire');
  });


  it('has attribute "aria-selected" when selected', () => {
    const carousel = document.querySelector('#carousel-1');
    assert.isNotNull(carousel, 'Expected handle to lightboard');

    const slide = carousel.querySelector('.mdlext-carousel__slide:nth-child(2)');
    assert.isNotNull(slide, 'Expected handle to slide');
    slide.focus();

    const spy = sinon.spy();
    carousel.addEventListener('select', spy);


    const selectListener = ( event ) => {
      assert.isNotNull(event.detail.source.getAttribute('aria-selected'), 'Expected slide to have attribute "aria-selected"');

      const selectList = [...carousel.queryselectorAll('.mdlext-carousel__slide')].filter(
        slide => slide.hasAttribute('aria-selected')
      );
      assert.equal(selectList.length, 1, 'Expected only one slide to have attribute "aria-selected"');
    };
    carousel.addEventListener('select', selectListener);

    try {
      // Trigger enter key on a slide
      const evt = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: VK_ENTER,
        shiftKey: false,
        view: window
      });

      slide.dispatchEvent(evt);
    }
    finally {
      carousel.removeEventListener('select', selectListener);
      carousel.removeEventListener('select', spy);
    }
    assert.isTrue(spy.called, 'Expected "select" event to fire');
  });



  /* TBD
   it('emits events', () => {
   });
   */


  function spyOnKeyboardEvent(target, keyCode, shiftKey=false) {
    const spy = sinon.spy();
    target.addEventListener('keydown', spy, true);

    try {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: keyCode,
        shiftKey: shiftKey,
        view: window
      });
      target.dispatchEvent(event);
    }
    finally {
      target.removeEventListener('keydown', spy);
    }

    assert.isTrue(spy.calledOnce, `Expected "keydown" event to fire once for key code ${keyCode}`);
  }


});
