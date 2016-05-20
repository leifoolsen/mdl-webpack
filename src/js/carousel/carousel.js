/**
 * @license
 * Copyright 2016 Leif Olsen. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This code is built with Google Material Design Lite,
 * which is Licensed under the Apache License, Version 2.0
 */

/**
 * Image carousel
 */

//import { createCustomEvent } from '../utils/custom-event';

import MdlExtAnimationLoop from './animationloop';

(function() {
  'use strict';

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

  const IS_UPGRADED    = 'is-upgraded';
  const IS_FOCUSED     = 'is-focused';
  const CAROUSEL       = 'mdlext-carousel';
  const SLIDE          = 'mdlext-carousel__slide';
  const ROLE           = 'list';
  const SLIDE_ROLE     = 'listitem';

  const RIPPLE = 'mdl-ripple';
  const RIPPLE_COMPONENT = 'MaterialRipple';
  const RIPPLE_CONTAINER = 'mdlext-carousel__slide__ripple-container';
  const RIPPLE_EFFECT = 'mdl-js-ripple-effect';
  const RIPPLE_EFFECT_IGNORE_EVENTS = 'mdl-js-ripple-effect--ignore-events';


  /**
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */
  const MaterialExtCarousel = function MaterialExtCarousel(element) {
    // Stores the element.
    this.element_ = element;

    // Handle to slide animation loop
    // Animation interval for slideshow, default 1000ms
    // Interval can be modified via 'data-interval' attribute or cia custom event detail.interval
    this.slideAnimation_ = new MdlExtAnimationLoop(1000);

    // Initialize instance.
    this.init();
  };

  window['MaterialExtCarousel'] = MaterialExtCarousel;


  /**
   * Start slideshow animation
   * @private
   */
  MaterialExtCarousel.prototype.startSlideShow_ = function() {

    const nextSlide = () => {
      let slide = this.element_.querySelector(`.${SLIDE}[aria-selected]`);

      if(slide) {
        slide.removeAttribute('aria-selected');
      }
      slide = slide.nextElementSibling; // animate previousElementSibling as well??
      if(!slide) {
        slide = this.element_.querySelector(`.${SLIDE}:first-child`);
        this.animateScroll_(0);
      }
      if(slide) {
        this.moveSlideIntoViewport_(slide);
        slide.setAttribute('aria-selected', '');
        this.emitSelectEvent_('next', null, slide);
        return true;
      }
      return false;
    };

    if(!this.slideAnimation_.running) {
      nextSlide();
      this.slideAnimation_.start(() => {
        return nextSlide(); // Will runs until cancelSlideShow_ is triggered
      });
    }

    // TODO: Pause animation when carousel is not in browser viewport
  };

  /**
   * Cancel slideshow if running. Emmits a 'pause' event
   * @private
   */
  MaterialExtCarousel.prototype.cancelSlideShow_ = function() {
    if(this.slideAnimation_.running) {
      this.slideAnimation_.stop();
      this.emitSelectEvent_('pause', VK_ESC, this.element_.querySelector(`.${SLIDE}[aria-selected]`));
    }
  };

  /**
   * Animate scroll
   * @param newPosition
   * @private
   */
  MaterialExtCarousel.prototype.animateScroll_ = function( newPosition ) {

    /*
     const easeInOutQuad = (t, b, c, d) => {
       // See: http://robertpenner.com/easing/
       t /= d / 2;
       if(t < 1) return c / 2 * t * t + b;
       t--;
       return -c / 2 * (t * (t - 2) - 1) + b;
     };
     */

    const inOutQuintic = (t, b, c, d) => {
      // See: http://robertpenner.com/easing/
      const ts = (t/=d)*t;
      const tc = ts*t;
      return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
    };

    const start = this.element_.scrollLeft;
    const distance = newPosition - start;

    if(distance !== 0) {
      const duration = Math.max(Math.min(Math.abs(distance), 400), 100); // duration is between 100 an 400ms
      let t = 0;

      new MdlExtAnimationLoop(33).start( timeElapsed => {
        t += timeElapsed;
        if(t < duration) {
          this.element_.scrollLeft = inOutQuintic(t, start, distance, duration);
          return true;
        }
        else {
          this.element_.scrollLeft = newPosition;
          return false;
        }
      });
    }
  };

  /**
   * Execute commend
   * @param event
   * @private
   */
  MaterialExtCarousel.prototype.command_ = function( event ) {
    let x = 0;
    let slide = null;
    const a = event.detail.action.toLowerCase();

    /*
    // This behaviour can be a bit confusing??
    switch (action.toLowerCase()) {
      case 'first':
      case 'scroll-prev':
        if(this.element_.scrollLeft === 0) {
          a = 'last';
        }
        break;
      case 'last':
      case 'scroll-next':
        if(this.element_.scrollLeft === this.element_.scrollWidth - this.element_.clientWidth) {
          a = 'first';
        }
        break;
    }
    */

    // Cancel slideshow if running
    this.cancelSlideShow_();

    switch (a) {
      case 'first':
        break;

      case 'last':
        x = this.element_.scrollWidth - this.element_.clientWidth;
        break;

      case 'scroll-prev':
        x = Math.max(this.element_.scrollLeft - this.element_.clientWidth, 0);
        break;

      case 'scroll-next':
        x = Math.min(this.element_.scrollLeft + this.element_.clientWidth, this.element_.scrollWidth - this.element_.clientWidth);
        break;

      case 'next':
      case 'prev':
        slide = this.element_.querySelector(`.${SLIDE}[aria-selected]`);
        if(slide) {
          slide = a === 'next' ? slide.nextElementSibling : slide.previousElementSibling;
          setFocus(slide);
          this.emitSelectEvent_(a, null,  slide);
        }
        return;

      case 'play':
        if(event.detail.interval) {
          this.slideAnimation_.interval_ = Math.max(parseInt(event.detail.interval), 200);
        }
        this.startSlideShow_();
        return;

      case 'pause':
        this.cancelSlideShow_();
        return;

      default:
        return;
    }

    this.animateScroll_(x);
  };

  /**
   * Handles custom command event, 'scroll-prev', 'scroll-next', 'first', 'last', next, prev, play, pause
   * @param event. A custom event
   * @private
   */
  MaterialExtCarousel.prototype.commandHandler_ = function( event ) {
    event.preventDefault();
    event.stopPropagation();
    if(event.detail && event.detail.action) {
      this.command_(event);
    }
  };

  /**
   * Handle keypress
   * @param event
   * @private
   */
  MaterialExtCarousel.prototype.keyDownHandler_ = function(event) {

    if (event && event.target && event.target !== this.element_) {

      let action = 'first';

      if ( event.keyCode === VK_HOME    || event.keyCode === VK_END
        || event.keyCode === VK_PAGE_UP || event.keyCode === VK_PAGE_DOWN) {

        event.preventDefault();
        if (event.keyCode === VK_END) {
          action = 'last';
        }
        else if (event.keyCode === VK_PAGE_UP) {
          action = 'scroll-prev';
        }
        else if (event.keyCode === VK_PAGE_DOWN) {
          action = 'scroll-next';
        }
        this.command_(action);
      }
      else if ( event.keyCode === VK_TAB
        || event.keyCode === VK_ENTER      || event.keyCode === VK_SPACE
        || event.keyCode === VK_ARROW_UP   || event.keyCode === VK_ARROW_LEFT
        || event.keyCode === VK_ARROW_DOWN || event.keyCode === VK_ARROW_RIGHT) {

        let slide = getSlide(event.target);

        // Cancel slideshow if running
        this.cancelSlideShow_();

        switch (event.keyCode) {
          case VK_ARROW_UP:
          case VK_ARROW_LEFT:
            event.preventDefault();
            action = 'prev';
            if(slide) {
              slide = slide.previousElementSibling;
              setFocus(slide);
            }
            break;

          case VK_ARROW_DOWN:
          case VK_ARROW_RIGHT:
            event.preventDefault();
            action = 'next';
            if(slide) {
              slide = slide.nextElementSibling;
              setFocus(slide);
            }
            break;

          case VK_TAB:
            if (event.shiftKey) {
              action = 'prev';
              if(slide) {
                slide = slide.previousElementSibling;
              }
            }
            else {
              action = 'next';
              if(slide) {
                slide = slide.nextElementSibling;
              }
            }
            break;

          case VK_SPACE:
          case VK_ENTER:
            event.preventDefault();
            action = 'select';
            break;
        }

        this.emitSelectEvent_(action, event.keyCode,  slide);
      }
    }
  };

  /**
   * Handle dragging
   * @param event
   * @private
   */
  MaterialExtCarousel.prototype.dragHandler_ = function(event ) {
    event.preventDefault();

    // Cancel slideshow if running
    this.cancelSlideShow_();

    let updating = false;
    let rAFDragId = 0;
    const startX = event.clientX || (event.touches !== undefined ? event.touches[0].clientX : 0);
    let prevX = startX;

    //console.log('begindrag', startX);

    const update = e => {
      const currentX = (e.clientX || (e.touches !== undefined ? e.touches[0].clientX : 0));
      const dx = prevX - currentX;

      if(dx < 0) {
        this.element_.scrollLeft = Math.max(this.element_.scrollLeft + dx, 0);
      }
      else if(dx > 0) {
        this.element_.scrollLeft = Math.min(this.element_.scrollLeft + dx, this.element_.scrollWidth - this.element_.clientWidth);
      }

      prevX = currentX;
      updating = false;
    };

    // drag handler
    const drag = e => {
      e.preventDefault();
      if(!updating) {
        rAFDragId = requestAnimationFrame( () => update(e));
        updating = true;
      }
    };

    // end drag handler
    const endDrag = e => {
      e.preventDefault();
      const x = e.clientX || (e.touches !== undefined ? e.touches[0].clientX : 0);

      //console.log('enddrag', x, startX-x, e, e.target);

      window.removeEventListener('mousemove', drag);
      window.removeEventListener('touchmove', drag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchend', endDrag);

      // cancel any existing drag rAF, see: http://www.html5rocks.com/en/tutorials/speed/animations/
      cancelAnimationFrame(rAFDragId);

      // If mouse did not move, trigger custom select event
      if(Math.abs(startX-x) < 2) {
        const slide = getSlide(e.target);
        setFocus(slide);
        this.emitSelectEvent_('click', null,  slide);
      }
    };

    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag);
    window.addEventListener('mouseup', endDrag); // .bind(this) does not work here
    window.addEventListener('touchend',endDrag);
  };

  /**
   * Handle focus
   * @param event
   * @private
   */
  MaterialExtCarousel.prototype.focusHandler_ = function(event) {
    const slide = getSlide(event.target);
    if(slide) {
      // The last focused slide has 'aria-selected', even if focus is lost
      [...this.element_.querySelectorAll(`.${SLIDE}[aria-selected]`)].forEach(
        slide => slide.removeAttribute('aria-selected')
      );
      slide.setAttribute('aria-selected', '');
      slide.classList.add(IS_FOCUSED);
    }
  };

  /**
   * Handle blur
   * @param event
   * @private
   */
  MaterialExtCarousel.prototype.blurHandler_ = function(event) {
    const slide = getSlide(event.target);
    if(slide) {
      slide.classList.remove(IS_FOCUSED);
    }
  };


  /**
   * Emits a custeom 'select' event
   * @param command
   * @param keyCode
   * @param slide
   * @private
   */
  MaterialExtCarousel.prototype.emitSelectEvent_ = function(command, keyCode, slide) {
    if(slide) {
      this.moveSlideIntoViewport_(slide);

      const evt = new window.CustomEvent('select', {
        bubbles: true,
        cancelable: true,
        detail: {
          command: command,
          keyCode: keyCode,
          source: slide
        }
      });

      /* TODO: use this in mdl-ext
       const evt = createCustomEvent('select', {
       bubbles: true,
       cancelable: true,
       detail: {
       command: command,
       keyCode: keyCode,
       source: slide
       }
       });
       */


      this.element_.dispatchEvent(evt);
    }
  };

  /**
   * Move slide into viewport - if needed
   * @param slide
   * @private
   */
  MaterialExtCarousel.prototype.moveSlideIntoViewport_ = function(slide) {
    const carouselRect = this.element_.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();

    if(slideRect.left < carouselRect.left) {
      const x = this.element_.scrollLeft - (carouselRect.left - slideRect.left);
      this.animateScroll_(x);
    }
    else if(slideRect.right > carouselRect.right) {
      const x = this.element_.scrollLeft - (carouselRect.right - slideRect.right);
      this.animateScroll_(x);
    }
  };


  // Helpers
  const getSlide = element => {
    if (!element  || element.parentNode.tagName === undefined || element.classList.contains(CAROUSEL)) {
      return null;
    }
    return element.classList.contains(SLIDE) ? element : getSlide(element.parentNode);
  };

  const setFocus = slide => {
    if(slide) {
      slide.focus();
    }
  };

  const addRipple = slide => {
    const rippleContainer = document.createElement('span');
    rippleContainer.classList.add(RIPPLE_CONTAINER);
    rippleContainer.classList.add(RIPPLE_EFFECT);
    const ripple = document.createElement('span');
    ripple.classList.add(RIPPLE);
    rippleContainer.appendChild(ripple);

    const img = slide.querySelector('img');
    if(img) {
      // rippleContainer blocks image title
      rippleContainer.title = img.title;
    }

    slide.appendChild(rippleContainer);
    componentHandler.upgradeElement(rippleContainer, RIPPLE_COMPONENT);
  };
  // End helpers


  // Public methods.

  /**
   * Cancel animation - if running.
   *
   * @public
   */
  MaterialExtCarousel.prototype.stopAnimation = function() {
    if(this.rAFId_ !== 0) {
      cancelAnimationFrame(this.rAFId_);
      this.rAFId_ = 0;
    }
  };
  MaterialExtCarousel.prototype['stopAnimation'] = MaterialExtCarousel.prototype.stopAnimation;


  /**
   * Initialize component
   */
  MaterialExtCarousel.prototype.init = function() {

    if (this.element_) {
      this.element_.setAttribute('role', ROLE);
      if(!Number.isInteger(this.element_.getAttribute('tabindex'))) {
        this.element_.setAttribute('tabindex', -1);
      }

      const hasRippleEffect = this.element_.classList.contains(RIPPLE_EFFECT);
      if (hasRippleEffect) {
        this.element_.classList.add(RIPPLE_EFFECT_IGNORE_EVENTS);
      }

      [...this.element_.querySelectorAll(`.${SLIDE}`)].forEach( slide => {
        slide.setAttribute('role', SLIDE_ROLE);
        if(!Number.isInteger(slide.getAttribute('tabindex'))) {
          slide.setAttribute('tabindex', 0);
        }
        if(hasRippleEffect) {
          addRipple(slide);
        }
      });

      // Listen to focus/blur events
      this.element_.addEventListener('focus', this.focusHandler_.bind(this), true);
      this.element_.addEventListener('blur',  this.blurHandler_.bind(this), true);

      // Listen to keyboard events
      this.element_.addEventListener('keydown', this.keyDownHandler_.bind(this), true);

      // Listen to drag events
      this.element_.addEventListener('mousedown' , this.dragHandler_.bind(this), true);
      this.element_.addEventListener('touchstart', this.dragHandler_.bind(this), true);

      // Click is handled by drag
      this.element_.addEventListener('click', e => e.preventDefault(), true);

      // Listen to custom event
      this.element_.addEventListener('command', this.commandHandler_.bind(this), false);

      // Slideshow interval
      if(this.element_.hasAttribute('data-interval')) {
        this.slideAnimation_.interval = Math.max(parseInt(this.element_.getAttribute('data-interval')), 200);
      }

      // Set upgraded flag
      this.element_.classList.add(IS_UPGRADED);
    }
  };

  /*
   * Downgrade component
   * E.g remove listeners and clean up resources
   *
   * Note: There is a bug i material component container; downgrade is never called!
   * Disables method temporarly to keep code coverage at 100% for functions.
   *
  MaterialExtCarousel.prototype.mdlDowngrade_ = function() {
    'use strict';
    console.log('***** MaterialExtCarousel.mdlDowngrade');
  };
   */

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  /* eslint no-undef: 0 */
  componentHandler.register({
    constructor: MaterialExtCarousel,
    classAsString: 'MaterialExtCarousel',
    cssClass: 'mdlext-js-carousel',
    widget: true
  });

})();
