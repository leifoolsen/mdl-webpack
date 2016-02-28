'use strict';

const accordionClass      = '.mdlext-accordion';
const accordionPanelClass = '.mdlext-accordion__panel';
const accordionTitleClass = '.mdlext-accordion__panel__title';

const VK_TAB = 9;
const VK_ENTER = 13;
const VK_SPACE = 32;
const VK_END = 35;
const VK_HOME = 36;
const VK_ARROW_LEFT = 37;
const VK_ARROW_UP = 38;
const VK_ARROW_RIGHT = 39;
const VK_ARROW_DOWN = 40;

export function initAccordions(fromEl = document) {
  let n = 0;
  [...fromEl.querySelectorAll(`${accordionClass}:not(.is-upgraded)`)].forEach( accordion => {
    if(initAccordion(accordion)) {
      n++;
    }
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
    header.addEventListener('click', ( function(event) {

      event.preventDefault();
      event.stopPropagation();

      const panel = this.parentNode;
      if(panel.hasAttribute('open')) {
        panel.removeAttribute('open');
        this.removeAttribute('aria-expanded');
      }
      else {
        const openPanel = accordionEl.querySelector(`${accordionPanelClass}[open]`);
        if(openPanel) {
          openPanel.removeAttribute('open');
          const h = openPanel.querySelector(accordionTitleClass);
          if(h) {
            h.removeAttribute('aria-expanded');
          }
        }
        panel.setAttribute('open', '');
        this.setAttribute('aria-expanded', '');
      }
      focus(panel);

    }).bind(header), true);

    header.addEventListener('keydown', ( function(event) {
      if (event.keyCode === VK_TAB
        || event.keyCode === VK_ENTER || event.keyCode === VK_SPACE
        || event.keyCode === VK_END || event.keyCode === VK_HOME
        || event.keyCode === VK_ARROW_UP || event.keyCode === VK_ARROW_LEFT
        || event.keyCode === VK_ARROW_DOWN || event.keyCode === VK_ARROW_RIGHT) {

        const panel = this.parentNode;
        const panels = panel.parentNode.children;
        let nextPanel = null;
        const n = panel.parentNode.childElementCount - 1;

        for (let i = 0; i <= n; i++) {

          if (event.keyCode === VK_HOME) {
            nextPanel = panels[0];
            break;
          }
          else if (event.keyCode === VK_END) {
            nextPanel = panels[n];
            break;
          }

          /*jshint eqeqeq:false */
          if(panels[i] == panel) {
            if(event.keyCode === VK_ARROW_UP || event.keyCode === VK_ARROW_LEFT) {
              if(i > 0) {
                nextPanel = panels[i-1];
              }
            }
            else if (event.keyCode === VK_ARROW_DOWN || event.keyCode === VK_ARROW_RIGHT) {
              if(i < n) {
                nextPanel = panels[i+1];
              }
            }
            else if (event.keyCode === VK_TAB) {
              if(event.shiftKey && i > 0) {
                if(!panels[i-1].hasAttribute('open')) {
                  nextPanel = panels[i-1];
                }
              }
              else if (i < n) {
                if(!panel.hasAttribute('open')) {
                  nextPanel = panels[i+1];
                }
              }
            }
            else if (event.keyCode === VK_ENTER || event.keyCode === VK_SPACE) {
              event.preventDefault();
              event.stopPropagation();

              // Trigger mouse click event for any attached listeners.
              const evt = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              this.dispatchEvent(evt);
            }
            break;
          }
        }
        if(nextPanel) {
          event.preventDefault();
          event.stopPropagation();
          focus(nextPanel);
        }
      }
    }).bind(header), true);

  });

}

function focus(panel) {
  const a = panel.querySelector(`${accordionTitleClass} a`);
  if(a) {
    a.focus();
  }
}
