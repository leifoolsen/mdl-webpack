'use strict';
import 'babel-polyfill';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import { expect, assert } from 'chai';
import { removeChilds } from '../../js/utils/domHelpers';

describe('MaterialExtCarousel', () => {

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
  </ul>
</div>
<div id='mount-2'>
</div>
</body>
</html>`;

  const fragment = `
    <ul id="carousel-2" class="mdlext-carousel mdlext-js-carousel">
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


  // list (role), A section containing listitem elements.
  it('has role="list"', () => {
    [...document.querySelectorAll('.mdlext-carousel')].forEach( carousel => {
      assert.equal(carousel.getAttribute('role'), 'list', 'Expected carousel to have role="list"');
    });
  });


  // listitem (role), A single item in a list or directory.
  it('has slides with role="listitem"', () => {
    [...document.querySelectorAll('.mdlext-carousel__slide')].forEach( slide => {
      assert.equal(slide.getAttribute('role'), 'listitem', 'Expected slide to have role="listitem"');
    });

  });


  /* TBD
  it('should have public methods available via widget', () => {
  });
  */

  /* TBD
  it('can call public methodes', () => {
  });
  */

  /* TBD
  it('trigger events', () => {
  });
  */


});
