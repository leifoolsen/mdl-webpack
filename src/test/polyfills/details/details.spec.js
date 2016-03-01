'use strict';
import 'babel-polyfill';
import requireUncached from 'require-uncached';
import jsdomify from 'jsdomify';
import { expect, assert } from 'chai';
import { qs, qsa } from '../../../js/utils/domHelpers';

describe('details', () => {

  const fixture = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Title</title>
</head>
<body>
  <div id='mount'>
    <details role="group" open>
      <summary role="button">Summary</summary>
      <p>A paragraph</p>
    </details>

    <details id="make-summary-to-be-first-child" role="group">
      <p>A paragraph before summary</p>
      <summary role="button">Summary</summary>
    </details>

    <details id="it-has-nested-details" role="group">
      <summary role="button">Summary</summary>
      <p>A paragraph</p>

      <details role="group">
        <summary role="button">Nested details</summary>
        <div>A div</div>
      </details>
    </details>

    <details id="it-should-have-a-summary-element">
     <p>A paragraph but no summary element</p>
    </details>
  </div>
</body>
</html>`;

  const fragment = `
<details id="fragment" role="group">
  <summary role="button">Fragment</summary>
  <p>This details should be inserted and polyfilled</p>
</details>`;

  let Details;
  let nativeSupport;

  before ( () => {
    jsdomify.create(fixture);

    nativeSupport =  ('open' in document.createElement('details'));

    // Must load details polyfill after jsdom
    Details = require('../../../js/polyfills/details/details');

    // Do I need this: "Waiting for content to be loaded in jsdom"?, see: https://gist.github.com/chad3814/5059671

  });

  after ( () => {
    jsdomify.destroy()
  });

  it('is polyfilled', () => {
    if(!nativeSupport) {
      assert.isNotNull(qs('#details-polyfill-css'), 'Expected CSS for detials polyfill');

      [...qsa('details')].forEach(details => {
        assert.isTrue(details.classList.contains('is-polyfilled'), 'Expected details element to have class "is-polyfilled"' );
      });
    }
  });

  it('is focusable', () => {
    assert.isAtLeast(qs('summary').tabIndex, 0);
  });

  it('makes summary to be first child', () => {
    assert.equal(qs('#make-summary-to-be-first-child').firstElementChild.nodeName.toLowerCase(), 'summary');
  });

  it('should add summary element if not present', () => {
    assert.equal(qs('#it-should-have-a-summary-element').firstElementChild.nodeName.toLowerCase(), 'summary');
  });

});
