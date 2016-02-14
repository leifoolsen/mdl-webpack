'use strict';


// First import the polyfills
// Note: Tried to use the webpack ProvidePlugin to add the polyfills as outlined
//       here: http://mts.io/2015/04/08/webpack-shims-polyfills,
//       and here : https://gist.github.com/Couto/b29676dd1ab8714a818f
//       but could not figure out how that should work

import 'custom-event';
import promise from 'es6-promise'; promise.polyfill();
import 'isomorphic-fetch'; // ... or import 'whatwg-fetch';
import 'dialog-polyfill/dialog-polyfill';
import { polyfillDetails } from './js/polyfills/details/details';
// End polyfills

import { debounce } from 'core-decorators';
import { throttle } from 'core-decorators';
import moment from 'moment';
import 'material-design-lite/material';

import './js/utils/domHelpers';
import './js/components/select/selectfield';

import { initAccordions } from './js/components/accordion/accordion';

class Header {
  titleClass = '.mdl-layout-title';

  constructor(selector = '#header') {
    this.selector = selector;
    this.headerEl = document.qs(this.selector);
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
    let titleTag = this.headerEl.qs(this.titleClass);
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
    this.drawerEl     = document.qs(this.selector);

    initAccordions(this.drawerEl);

    this.navLinkQuery = `${this.accordionId} a.mdl-navigation__link`;

    for (let anchor of document.qsa(this.navLinkQuery)) {

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
    const currentNav = document.qs(`${this.accordionId} ${this.currentNavClass}`);
    if(currentNav) {
      currentNav.classList.remove(this.currentNavClassName);
    }
    navLinkEl.classList.add(this.currentNavClassName);
  }

  closeDrawerIfVisible() {
    // See: http://stackoverflow.com/questions/31536467/how-to-hide-drawer-upon-user-click
    // See: https://github.com/google/material-design-lite/blob/v1.0.6/material.js#L3234
    const layout = document.qs(this.layoutClass);
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
    this.contentEl = document.qs(this.selector);
    this.contentEl.addEventListener('scroll', (event) => this.scroll(event));
  }

  listenTo(notification, fn) {
    this.notifications[notification] = fn;
  }

  show(event) {
    let contentPanelEl = document.qs(this.contentPanelId);
    let href = event.detail.anchor.href;

    if(href.endsWith('/#js')) {
      this.renderWithJS();
    }
    else {
      window.fetch(href, {method: 'get'})
        .then(response => response.text())
        .then(text => {
          contentPanelEl.removeChilds();
          contentPanelEl.insertAdjacentHTML('afterbegin', text);

          polyfillDetails(contentPanelEl);

          // How do I call this directly from iported page??
          initAccordions(contentPanelEl);

          [...contentPanelEl.qsa('script')].forEach(script => {
            eval(script.innerHTML);
          });

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
    let contentPanel = document.qs(this.contentPanelId);
    contentPanel.removeChilds();

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
    let contentPanel = document.qs(this.contentPanelId);
    contentPanel.removeChilds();

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
    pubsub.publish('window.resized', { element: document.qs('#content') } );
  }

  run() {
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

