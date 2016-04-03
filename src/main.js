'use strict';

// First import the polyfills
// Note: Uses the webpack ProvidePlugin to add polyfills as outlined
//       here: http://mts.io/2015/04/08/webpack-shims-polyfills,
//       and here : https://gist.github.com/Couto/b29676dd1ab8714a818f
//       We do not need to import the polyfills anymore!
//       The dialog polyfill must be handled separateley, see App.run() method

import { polyfillDetails } from 'lavu-details-polyfill';

//const eqjs = require('eq.js');
import eqjs from 'eq.js';
window.eqjs = eqjs;        // Put in global scope - for use with script in page

// End polyfills

import { debounce, throttle} from 'core-decorators';
import moment from 'moment';
import 'material-design-lite/material';
import 'mdl-ext';

import {qs, qsa, removeChilds} from './js/utils/domHelpers';

class Header {
  titleClass = '.mdl-layout-title';

  constructor(selector = '#header') {
    this.selector = selector;
    this.headerEl = qs(this.selector);
    this.prevContentScrollTop = 0;
  }

  stickToElement(event) {
    let element = event.detail.element;
    let currentContentScrollTop = element.scrollTop;
    let scrollDiff = this.prevContentScrollTop - currentContentScrollTop;
    let headerTop = (parseInt( window.getComputedStyle( this.headerEl ).getPropertyValue( 'top' ) ) || 0) + scrollDiff;

    if(currentContentScrollTop <= 0) {
      // Scrolled to the top. Header sticks to the top
      this.headerEl.style.top = '0';
      this.headerEl.classList.remove('is-scroll');
    }
    else if(scrollDiff > 0) {
      // Scrolled up. Header slides in
      this.headerEl.style.top = ( headerTop > 0 ? 0 : headerTop ) + 'px';
      this.headerEl.classList.add('is-scroll');
    }
    else if(scrollDiff < 0) {
      // Scrolled down
      this.headerEl.classList.add('is-scroll');

      if (element.scrollHeight - element.scrollTop <= element.offsetHeight) {
        // Bottom of content
        this.headerEl.style.top = '0';
      }
      else {
        let offsetHeight = this.headerEl.offsetHeight;
        this.headerEl.style.top = ( Math.abs( headerTop ) > offsetHeight ? -offsetHeight : headerTop ) + 'px';
      }
    }

    this.prevContentScrollTop = currentContentScrollTop;
  }

  adjustWidthToElement(event) {
    let element = event.detail.element;
    this.headerEl.style.width = element.clientWidth + 'px';
  }

  updateTitle(event) {
    let anchor = event.detail.anchor;
    let titleTag = qs(this.titleClass, this.headerEl);
    titleTag.textContent = anchor.textContent;
  }
}

class Drawer {
  accordionId         = '#accordion';
  currentNavClassName = 'mdl-navigation__link--current';
  currentNavClass     = `.${this.currentNavClassName}`;
  layoutClass         = '.mdl-layout';
  isVisibleClassName  = 'is-visible';
  notifications       = {};

  constructor(selector= '#drawer') {
    this.selector     = selector;
    this.drawerEl     = qs(this.selector);

    this.navLinkQuery = `${this.accordionId} a.mdl-navigation__link`;

    for (let anchor of qsa(this.navLinkQuery)) {

      anchor.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        if(anchor.href !== anchor.baseURI) {
          this.setActiveNavLink(anchor);
          this.closeDrawerIfVisible();
          this.menuSelect(anchor);
        }
      });
    }
  }

  listenTo(notification, fn) {
    this.notifications[notification] = fn;
  }

  setActiveNavLink(navLinkEl) {
    const currentNav = qs(`${this.accordionId} ${this.currentNavClass}`);
    if(currentNav) {
      currentNav.classList.remove(this.currentNavClassName);
    }
    navLinkEl.classList.add(this.currentNavClassName);
  }

  closeDrawerIfVisible() {
    // See: http://stackoverflow.com/questions/31536467/how-to-hide-drawer-upon-user-click
    // See: https://github.com/google/material-design-lite/blob/v1.0.6/material.js#L3234
    const layout = qs(this.layoutClass);
    if(this.drawerEl.classList.contains(this.isVisibleClassName)) {
      layout.MaterialLayout.drawerToggleHandler_();
    }
  }

  menuSelect(anchorEl) {
    if(this.notifications.menuselect) {
      this.notifications.menuselect( { anchor: anchorEl } );
    }
  }
}

class Content {
  contentPanelId = '#content-panel';
  notifications  = {};

  constructor(selector = '#content') {
    this.selector = selector;
    this.contentEl = qs(this.selector);
    this.contentEl.addEventListener('scroll', (event) => this.scroll(event));
  }

  listenTo(notification, fn) {
    this.notifications[notification] = fn;
  }

  show(event) {
    let contentPanelEl = qs(this.contentPanelId);
    let href = event.detail.anchor.href;

    if(href.endsWith('/#js')) {
      this.renderWithJS();
    }
    else {
      window.fetch(href, {method: 'get'})
        .then(response => response.text())
        .then(text => {
          removeChilds(contentPanelEl);
          contentPanelEl.insertAdjacentHTML('afterbegin', text);

          [...qsa('script', contentPanelEl)].forEach(script => {
            eval(script.innerHTML);
          });

          polyfillDetails(contentPanelEl);

          eqjs.refreshNodes();
          eqjs.query(undefined, true);

          this.contentChange();
        })
        .catch(err => console.error(err))
      ;
    }
  }

  contentChange() {
    componentHandler.upgradeDom();
    this.contentEl.scrollTop = 0;

    if(this.notifications.contentchange) {
      this.notifications.contentchange( { element: this.contentEl } );
    }
  }

  @throttle
  scroll(event) {
    event.stopPropagation();

    if(this.notifications.scrollchange) {
      this.notifications.scrollchange( { element: this.contentEl } );
    }
  }

  renderWithJS() {
    // Messy code :-)
    let contentPanel = qs(this.contentPanelId);
    removeChilds(contentPanel);

    const h1 = document.createElement('h1');
    h1.textContent = `${moment().format('YYYY-MM-DD HH:mm:ss')} - Yo MDL!`;
    h1.insertAdjacentHTML('beforeend', '&nbsp;<i class="material-icons md-48">thumb_up</i>');
    contentPanel.appendChild(h1);

    const p =  document.createElement('p');
    p.textContent = 'Material Design Lite is a light-weight implementation of Material Design, specifically crafted for the web. For more detailed guidelines and specifications for other platforms please refer to the Material Design site.';
    contentPanel.appendChild(p);

    const p2 = '<p>This page is rendered using JavaScript. See the <strong>Content.index()</strong> method.</p>';
    contentPanel.insertAdjacentHTML('beforeend', p2);

    const button = document.createElement('button');
    const textNode = document.createTextNode('A Button');
    button.appendChild(textNode);
    button.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent';
    contentPanel.appendChild(button);
    componentHandler.upgradeElement(button);

    // Use require to fetch HTML. Es6 imports and exports must happen at the top level of js-file.
    const h3 = document.createElement('h3');
    h3.textContent ='The next section of HTML is loaded using require';
    contentPanel.appendChild(h3);

    const html = require('./html/material-design-icons-font-demo.html');
    contentPanel.insertAdjacentHTML('beforeend', html);

    this.contentChange();
  }

  index() {
    let contentPanel = qs(this.contentPanelId);
    removeChilds(contentPanel);

    // Use require to fetch HTML. Es6 imports and exports must happen at the top level of js-file.
    const html = require('./html/home.html');
    contentPanel.insertAdjacentHTML('beforeend', html);

    this.contentChange();
  }

}


const pubsub = (doc => {
  // See : https://davidwalsh.name/customevent
  // See : http://codepen.io/stevenbenisek/pen/qOmRye
  // Note: A polyfill is required for browsers that do not support CustomEvent constructor

  return {
    publish    : (type, detail)   => doc.dispatchEvent( new CustomEvent(type, { detail: detail }) ),
    subscribe  : (type, listener) => doc.addEventListener( type, listener, false ),
    unsubscribe: (type, listener) => doc.removeEventListener( type, listener, false )
  };
})(document);


class App {
  name = 'mdl-webpack';

  constructor() {
    this.header  = new Header();
    this.content = new Content();
    this.drawer  = new Drawer();

    // DOM Events
    window.addEventListener('resize',            () => App.windowResize());
    window.addEventListener('orientationchange', () => App.windowResize());

    // Custom events
    pubsub.subscribe('content.scrolled', event => this.header.stickToElement(event));
    this.content.listenTo('scrollchange', detail => pubsub.publish('content.scrolled', detail));

    pubsub.subscribe('content.changed', event => this.header.adjustWidthToElement(event));
    this.content.listenTo('contentchange', detail => pubsub.publish('content.changed', detail));

    pubsub.subscribe('window.resized', event => this.header.adjustWidthToElement(event));

    pubsub.subscribe('drawer.menu.selected', event => this.content.show(event));
    pubsub.subscribe('drawer.menu.selected', event => this.header.updateTitle(event));
    this.drawer.listenTo('menuselect', detail => pubsub.publish('drawer.menu.selected', detail));
  }

  @debounce
  static windowResize() {
    pubsub.publish('window.resized', { element: qs('#content') } );
  }


  loadDialogPolyfillIfRequired() {
    // Could not use webpack.ProvidePlugin to load the dialog polyfill.

    if(!document.createElement('dialog').showModal) {
      // Webpack parses the inside of require.ensure at build time to know that "dialog-polyfill/dialog-polyfill"
      // should be bundled separately. You could get the same effect by passing
      // ['dialog-polyfill/dialog-polyfill'] as the first argument.
      // See: http://ianobermiller.com/blog/2015/06/01/conditionally-load-intl-polyfill-webpack/

      require.ensure([], () => {
        // Ensure only makes sure the module has been downloaded and parsed.
        // Now we actually need to run it to install the polyfill.
        let dialogPolyfill = require('dialog-polyfill/dialog-polyfill');
        window['dialogPolyfill'] = dialogPolyfill;
      });
    }
  }

  run() {
    this.loadDialogPolyfillIfRequired();
    this.content.index();
  }
}

// Start
document.addEventListener('DOMContentLoaded', () => new App().run());



/*
 * Debounce vs Throttle
 * Throttle is designed to call function in certain interval during constant call. Like: window.scroll.
 * Debounce is designed to call function only once during one certain time. not matter how many time it called. Like: submit button click
 */



/*
 import EventEmitter  from './js/decorators/eventemitter-decorator';

 @EventEmitter
 class Door {

 }
 const door = new Door();
 door.on('ring', (sound) => console.log(`Door bell: ${sound}!!`));
 door.emit('ring', 'pling plong ding dong');
 */

