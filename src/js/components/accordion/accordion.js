'use strict';

const accordionClass      = '.mdlext-accordion';
const accordionPanelClass = '.mdlext-accordion__panel';
const accordionTitleClass = '.mdlext-accordion__panel__title';

export function initAccordions(fromEl = document) {
  let n = 0;
  [...fromEl.querySelectorAll(`${accordionClass}:not(.is-upgraded)`)].forEach( accordion => {
    if(initAccordion(accordion)) n++;
  });
  return n;
}

export function initAccordion(accordionEl) {

  if(!accordionEl || accordionEl.classList.contains('is-upgraded')) {
    return false;
  }

  accordionEl.classList.add('is-upgraded');

  if(!accordionEl.hasAttribute('role')) {
    accordionEl.setAttribute('role', 'tablist');
  }

  [...accordionEl.querySelectorAll(accordionTitleClass)].forEach( header => {
    if(!header.hasAttribute('role')) {
      header.setAttribute('role', 'tab');
    }
    if(!header.parentNode.hasAttribute('role')) {
      header.parentNode.setAttribute('role', 'tabpanel');
    }
    if(!header.parentNode.hasAttribute('open')) {
      header.setAttribute('aria-expanded', '');
    }
    header.addEventListener("click", ( function(event) {
      event.preventDefault();

      if(!this.parentNode.hasAttribute('open')) {

        let openPanel = accordionEl.querySelector(`${accordionPanelClass}[open]`);
        if(openPanel) {
          openPanel.removeAttribute('open');
          let h = openPanel.querySelector(accordionTitleClass);
          if(h) {
            h.removeAttribute('aria-expanded');
          }
        }
        this.parentNode.setAttribute('open', '');
        this.setAttribute('aria-expanded', '');
      }
    }).bind(header), true);
  });
}
