'use strict';

// Alias for (el||document).querySelector
// See: https://github.com/stevermeister/bling.js
// See: https://github.com/kentcdodds/es6-todomvc/blob/master/js/helpers.js
// See: http://stackoverflow.com/questions/34157329/queryselector-and-queryselectorall-alias
document.qs = document.querySelector.bind(document);
Element.prototype.qs = function () {
  return this.querySelector(...arguments);  //eslint-disable-line
};


// Alias for (el||document).querySelectorAll
// See: https://github.com/stevermeister/bling.js
// See: https://github.com/kentcdodds/es6-todomvc/blob/master/js/helpers.js
// See: http://stackoverflow.com/questions/34157329/queryselector-and-queryselectorall-alias
//
// Note:
// The returned NodeList is not iterable, e.g. with foreach).
// As an alternative use a for loop:
// for (let el of document.qsa('h1')) {
//   console.log(el);
// }
//
// ... or use the spread operator:
//
// [... document.qsa('h1')].forEach(function (el) {
//   console.log(el);
// });
//
document.qsa = document.querySelectorAll.bind(document);
Element.prototype.qsa = function() {
  return this.querySelectorAll(...arguments);  //eslint-disable-line
};

// Remove child element(s)
function removeChilds(el, forceReflow = true) {

  // See: http://jsperf.com/empty-an-element/16
  while (el.lastChild) {
    el.removeChild(el.lastChild);
  }
  if(forceReflow) {
    // See: http://jsperf.com/force-reflow
    const d = el.style.display;

    el.style.display = 'none';
    el.style.display = d;
  }
  return el;
}

Element.prototype.removeChilds = function (forceReflow = true) {
  return removeChilds(this, forceReflow);
};


