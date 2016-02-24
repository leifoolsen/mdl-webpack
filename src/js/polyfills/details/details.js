'use strict';

/**
 * Code copied/modified/inspired from/by:
 *   https://github.com/jordanaustin/Details-Expander
 *   https://github.com/chemerisuk/better-details-polyfill
 *   http://codepen.io/stevef/pen/jiCBE
 *   http://blog.mxstbr.com/2015/06/html-details/
 *   http://html5doctor.com/the-details-and-summary-elements/
 *   http://zogovic.com/post/21784525226/simple-html5-details-polyfill
 *   http://www.sitepoint.com/fixing-the-details-element/
 *   https://www.smashingmagazine.com/2014/11/complete-polyfill-html5-details-element/
 *   https://www.w3.org/TR/2011/WD-html5-author-20110705/the-details-element.html
 *   https://www.w3.org/TR/html-aria/#index-aria-group
 *   https://www.w3.org/WAI/GL/wiki/Using_aria-expanded_to_indicate_the_state_of_a_collapsible_element
 *   https://www.w3.org/TR/wai-aria-practices-1.1/
 *   https://www.w3.org/TR/html-aria/#index-aria-group
 */

const VK_ENTER = 13;
const VK_SPACE = 32;
const hasNativeDetailsSupport =  ('open' in document.createElement('details'));

function injectCSS() {

  if(hasNativeDetailsSupport) {
    return false;
  }

  /*
    Modified from: https://github.com/jordanaustin/Details-Expander/blob/master/src/css/main.css

    NOTE:
    These are defaults meant to mimic the default unstyled browser look.
    I highly recommend you style your details tags but don't do it here.
    Just overwrite the style. Almost everything can be fully customized.
    Anything that shouldn't be overwritten has an !important on it.

    Semantic (correct) markup example:

    <details role="group" open>
      <summary role="button">Show/Hide me</summary>
      <p>Some content ..... etc.</p>
    </details>


    Note: There is no guarantee that the browser's implementation of the <details> element will
    respect it's child elements layout when toggeling the details. To preserve the child elements layout,
    always wrap the child elements inside a <div>.

    <style>
      .my-content { display : flex; }
    </style
    <details role="group">
      <summary role="button">Show/Hide me</summary>
      <div>
        <div class="my-content">
          <p>Some content ..... etc.</p>
        </div>
      </div>
    </details>
   */

  const css = `
    details, details>summary {
      display: block;
    }
    details > summary {
      min-height: 1.4em;
      padding: 0.125em;
    }
    details > summary:before {
      content:"►";
      font-size: 1em;
      position: relative;
      display: inline-block;
      width: 1em;
      height: 1em;
      margin-right: 0.3em;
      -webkit-transform-origin: 0.4em 0.6em;
         -moz-transform-origin: 0.4em 0.6em;
          -ms-transform-origin: 0.4em 0.6em;
              transform-origin: 0.4em 0.6em;
    }
    details[open] > summary:before {
      content:"▼"
    }
    details > *:not(summary) {
      display: none;
      opacity: 0;
    }
    details[open] > *:not(summary) {
      display: block;
      opacity: 1;

      /* If you need to preserve the original display attribute then wrap detail child elements in a div-tag */
      /* e.g. if you use an element with "display: inline", then wrap it inside a div */
      /* Too much hassle to make JS preserve original attribute */
    }

    /* Use this to hide native indicator and use pseudoelement instead
    summary::-webkit-details-marker {
      display: none;
    }
    */

`;

  const style = document.createElement('style');
  style.textContent = css
    .replace(/(\/\*([^*]|(\*+[^*\/]))*\*+\/)/gm, '') // remove comments from CSS, see: http://www.sitepoint.com/3-neat-tricks-with-regular-expressions/
    .replace( /\s/gm, ' ' );                        // replaces consecutive spaces with a single space

  // WebKit hack :(
  style.appendChild(document.createTextNode(''));

  //console.log(style.textContent);

  // Must be the first stylesheet so it does not override user css
  document.head.insertBefore(style, document.head.firstChild);

  return true;
}

export function polyfillDetails(fromEl = document) {

  if(hasNativeDetailsSupport) {
    return false;
  }


  [...fromEl.querySelectorAll('details:not(.is-polyfilled)')]
  //.filter( details => !details.classList.contains('is-upgraded') )
  .forEach( details => {

    details.classList.add('is-polyfilled'); // flag to prevent doing this more than once

    let summary = details.querySelector('summary:first-child');

    // If there is no child summary element, this polyfill
    // should provide its own legend; "Details"
    if (!summary) {
      summary = document.createElement('summary');
      summary.textContent = 'Details';
      details.insertBefore(summary, details.firstChild);
    }

    // <summary> must be the first child of <details>
    if (details.firstChild !== summary) {
      details.removeChild(summary);
      details.insertBefore(summary, details.firstChild);
    }

    summary.tabIndex = 0;

    // Respect layout of child elements!
    // Chrome does not respect the child elements layout, so there is no need to implement this in the polyfill.
    // Instead you should wrap the details child elements inside a <div> to preserve the child elements layout.
    /*
    let items = details.querySelectorAll('details > *:not(summary)');
    if(items.length > 0) {
      let newChild = document.createElement('div');
      for (let i = 0; i < items.length; i++) {
        newChild.appendChild(items[i]);
      }
      details.insertBefore(newChild, null);
    }
    */

    // Events
    summary.addEventListener('keydown', event => {
      if (event.target === summary) {
        if (event.keyCode === VK_ENTER || event.keyCode === VK_SPACE) {
          event.preventDefault();
          event.stopPropagation();

          // Trigger mouse click event for any attached listeners.
          const evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          summary.dispatchEvent(evt);
        }
      }
    }, true);

    summary.addEventListener('click', event => {
      if (event.target === summary) {
        if (details.hasAttribute('open')) {
          details.removeAttribute('open');
        }
        else {
          details.setAttribute('open', 'open');
        }
      }
    }, true);

  });

  return true;
}


document.addEventListener('DOMContentLoaded', () => {
  injectCSS();
  polyfillDetails(document);
});
