'use strict';
import 'babel-polyfill';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import { expect, assert } from 'chai';
import sinon from 'sinon';
import { qs, qsa } from '../../../js/utils/domHelpers';

describe('MaterialExtSelectfield', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Select Fixture</title>
</head>
<body>
<div id='mount'>
  <div class="mdlext-selectfield mdlext-js-selectfield">
    <select class="mdlext-selectfield__select" id="select-1" name="select-1" autofocus >
      <option value=""></option>
      <option value="option1">option 1</option>
      <option value="option2">option 2</option>
      <option value="option3">option 3</option>
      <option value="option4">option 4</option>
      <option value="option5">option 5</option>
    </select>
    <label class="mdlext-selectfield__label" for="select-1">Profession</label>
  </div>
  <div class="mdlext-selectfield mdlext-js-selectfield">
    <select class="mdlext-selectfield__select" id="select-2" name="select-2" disabled >
      <option value=""></option>
      <option value="option1">option 1</option>
    </select>
    <label class="mdlext-selectfield__label" for="select-1">Profession</label>
  </div>
  <div id="mount-2">
  </div>
</div>
</body>
</html>`;

  const fragment = `
<div class="mdlext-selectfield mdlext-js-selectfield">
  <select class="mdlext-selectfield__select" id="select-country" name="select-country" autofocus >
    <option value=""></option>
    <option value="option1">Norway</option>
    <option value="option2">Iceland</option>
    <option value="option3">Sweden</option>
    <option value="option4">Denmark</option>
    <option value="option5">Finalnd</option>
  </select>
  <label class="mdlext-selectfield__label" for="select-country">Country</label>
</div>`;

  before ( () => {
    jsdomify.create(fixture);

    // Must load MDL after jsdom, see: https://github.com/mochajs/mocha/issues/1722
    requireUncached( 'material-design-lite/material');
    global.componentHandler = window.componentHandler;
    assert.isObject(componentHandler, 'No global MDL component handler');

    requireUncached( '../../../js/components/select/selectfield' );

    //global.componentHandler.upgradeAllRegistered();
    //global.componentHandler.upgradeDom();
  });

  after ( () => {
    jsdomify.destroy()
  });

  it('should be globally available', () => {
    assert.isFunction(window['MaterialExtSelectfield'], 'No global MaterialExtSelecfield');
  });

  it('should upgrade when DOM render', () => {
    const element = qs('#select-1');
    assert.isNotNull(element);
    assert.isTrue(element.parentNode.classList.contains('is-upgraded'));

    const dataUpgraded = element.parentNode.getAttribute('data-upgraded');
    assert.isNotNull(dataUpgraded);
    assert.isAtLeast(dataUpgraded.indexOf('MaterialExtSelectfield'), 0);
  });

  it('should upgrade successfully when a new component is appended to the DOM', () => {
    const mount = document.getElementById('mount-2');
    assert.isNotNull(mount);

    // Element.insertAdjacentHTML does not work with jsdomify!
    //mount.insertAdjacentHTML('beforeend', fragment);
    mount.innerHTML = fragment;

    const element = qs('#select-country');
    assert.isNotNull(element);

    let dataUpgraded = element.getAttribute('data-upgraded');
    assert.isNull(dataUpgraded);

    componentHandler.upgradeElement(element, 'MaterialExtSelectfield');

    dataUpgraded = element.getAttribute('data-upgraded');
    assert.isNotNull(dataUpgraded);
    assert.isAtLeast(dataUpgraded.indexOf('MaterialExtSelectfield'), 0);
  });

  it('should be a widget', () => {
    const el = createSingleLineSelectfield();
    componentHandler.upgradeElement(el, 'MaterialExtSelectfield');
    expect(el.MaterialExtSelectfield).to.be.a('object');
  });

  it('should have public methods available via widget', () => {
    const el = createSingleLineSelectfield();
    componentHandler.upgradeElement(el, 'MaterialExtSelectfield');
    const methods = [
      'checkDisabled',
      'checkValidity',
      'checkDirty',
      'checkFocus',
      'disable',
      'enable',
      'change'
    ];
    methods.forEach(function(item) {
      expect(el.MaterialExtSelectfield[item]).to.be.a('function');
    });
  });

  it('should be invalid after upgrade if invalid previously', () => {
    const el = createSingleLineSelectfield();
    el.classList.add('is-invalid');
    componentHandler.upgradeElement(el);
    expect(el.classList.contains('is-invalid')).to.equal(true);
  });

  it('trigger events', () => {
    const select = qs('#select-1');
    assert.isNotNull(select);
    spyOnEvent('change', select);
    spyOnEvent('focus', select);
    spyOnEvent('blur', select);
    spyOnEvent('reset', select);
  });

  it('can call public methodes', () => {
    const el = qs('.mdlext-selectfield');
    el.MaterialExtSelectfield.checkDisabled();
    el.MaterialExtSelectfield.checkValidity();
    el.MaterialExtSelectfield.checkDirty();
    el.MaterialExtSelectfield.checkFocus();
    el.MaterialExtSelectfield.disable();
    el.MaterialExtSelectfield.enable();
    el.MaterialExtSelectfield.checkFocus();
    el.MaterialExtSelectfield.change('option2');
    assert(true);
  });


  function spyOnEvent(name, target) {
    let spy = sinon.spy();
    target.addEventListener(name, spy);

    const evt = new Event(name, {
      bubbles: true,
      cancelable: true,
      view: window
    });
    target.dispatchEvent(evt);
    target.removeEventListener(name, spy);
    assert.isTrue(spy.calledOnce, `Expected event ${name} to fire once`);
  }

  function createSingleLineSelectfield() {
    const container = document.createElement('div');
    const select = document.createElement('select');
    const label = document.createElement('label');
    const errorMessage = document.createElement('span');
    container.className = 'mdlext-selectfield mdlext-js-selectfield';
    select.className = 'mdlext-selectfield__select';
    select.id = 'select-testInput';
    label.for = select.id;
    label.className = 'mdlext-selectfield__label';
    label.text = 'Country';
    errorMessage.className = 'mdlext-selectfield__error';
    errorMessage.text = 'Nothing selected.';

    let opt;
    for (let i = 0; i < 5; i++) {
      opt = document.createElement("option");
      opt.value = `Option #${i}`;
      opt.innerHTML = opt.value;
      select.appendChild(opt);
    }
    container.appendChild(select);
    container.appendChild(label);
    container.appendChild(errorMessage);
    return container;
  }

});
