(function() {
  'use strict';

  const VK_TAB         = 9;
  const VK_ENTER       = 13;
  const VK_SPACE       = 32;
  const VK_END         = 35;
  const VK_HOME        = 36;
  const VK_ARROW_LEFT  = 37;
  const VK_ARROW_UP    = 38;
  const VK_ARROW_RIGHT = 39;
  const VK_ARROW_DOWN  = 40;

  const IS_UPGRADED    = 'is-upgraded';
  const CAROUSEL       = 'mdlext-carousel';
  const SLIDE          = 'mdlext-carousel__slide';
  const ROLE           = 'list';
  const SLIDE_ROLE     = 'listitem';

  //const SLIDE_TABSTOP  = 'mdlext-carousel__slide__frame';
  //const RIPPLE_COMPONENT = 'MaterialRipple';
  //const RIPPLE_CONTAINER = 'mdlext-carousel__slide__ripple-container';
  //const RIPPLE_EFFECT = 'mdl-js-ripple-effect';
  //const RIPPLE_EFFECT_IGNORE_EVENTS = 'mdl-js-ripple-effect--ignore-events';


  /**
   * @constructor
   * @param {Element} element The element that will be upgraded.
   */
  const MaterialExtCarousel = function MaterialExtCarousel(element) {
    // Stores the element.
    this.element_ = element;

    // Initialize instance.
    this.init();
  };

  window['MaterialExtCarousel'] = MaterialExtCarousel;

  /**
   * Animate scroll
   * @param action
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

    const runAanimation = tick => {
      let timeStart   = Date.now();
      let timeElapsed = 0;
      let running     = true;

      function loop( now ) {
        if (running) {
          requestAnimationFrame( () => loop( Date.now() ));
          timeElapsed += now - timeStart;
          running = tick( timeElapsed, now-timeStart );
          timeStart = now;
        }
      }
      loop(timeStart);
    };

    const start = this.element_.scrollLeft;
    const distance = newPosition - this.element_.scrollLeft;
    const duration = 300;

    if(distance !== 0) {
      runAanimation((timeElapsed /*, deltaT */) => {
        if(timeElapsed < duration) {
          this.element_.scrollLeft = inOutQuintic(timeElapsed, start, distance, duration);
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
   * @param action
   * @private
   */
  MaterialExtCarousel.prototype.command_ = function( action ) {
    let x = 0;
    const a = action.toLowerCase();

    /*
    // Maybe a bit confusing??
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
      default:
        return;
    }
    this.animateScroll_(x);
  };

  /**
   * Handles custom command event, 'scroll-prev', 'scroll-next', 'first', 'last'
   * @param event. A custom event
   * @private
   */
  MaterialExtCarousel.prototype.commandHandler_ = function( event ) {
    event.preventDefault();
    event.stopPropagation();
    if(event.detail && event.detail.action) {
      this.command_(event.detail.action);
    }
  };

  /**
   * Handle keypress
   * @param event
   * @private
   */
  MaterialExtCarousel.prototype.keyDownHandler_ = function(event) {

    if (event && event.target && event.target !== this.element_) {
      if ( event.keyCode === VK_TAB
        || event.keyCode === VK_ENTER      || event.keyCode === VK_SPACE
        || event.keyCode === VK_HOME       || event.keyCode === VK_END
        || event.keyCode === VK_ARROW_UP   || event.keyCode === VK_ARROW_LEFT
        || event.keyCode === VK_ARROW_DOWN || event.keyCode === VK_ARROW_RIGHT) {

        let action = 'first';
        if (event.keyCode === VK_END) {
          action = 'last';
        }
        else if (event.keyCode === VK_ARROW_UP || event.keyCode === VK_ARROW_LEFT) {
          action = 'prev';
        }
        else if (event.keyCode === VK_ARROW_DOWN || event.keyCode === VK_ARROW_RIGHT) {
          action = 'next';
        }
        else if (event.keyCode === VK_TAB) {
          action = 'next';
          if (event.shiftKey) {
            action = 'prev';
          }
        }
        else if (event.keyCode === VK_SPACE || event.keyCode === VK_ENTER) {
          action = 'select';
        }

        // TODO
        console.log('keydown', action,  event, event.target);
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

    let updating = false;
    let rAFIndex = 0;
    const startX = event.clientX || (event.touches !== undefined ? event.touches[0].clientX : 0);
    let prevX = startX;

    console.log('begindrag', startX);

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
        rAFIndex = requestAnimationFrame( () => update(e));
        updating = true;
      }
    };

    // end drag handler
    const endDrag = e => {
      e.preventDefault();

      const x = e.clientX || (e.touches !== undefined ? e.touches[0].clientX : 0);


      console.log('enddrag', x, startX-x, e, e.target);

      window.removeEventListener('mousemove', drag);
      window.removeEventListener('touchmove', drag);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchend', endDrag);

      // cancel any existing rAF, see: http://www.html5rocks.com/en/tutorials/speed/animations/
      cancelAnimationFrame(rAFIndex);

      // TODO
      // If mouse did not move, trigger custom select event
      if(Math.abs(startX-x) < 2) {
        focus( getSlide(e.target) );
      }
    };

    window.addEventListener('mousemove', drag);
    window.addEventListener('touchmove', drag);
    window.addEventListener('mouseup', endDrag); // .bind(this) does not work here
    window.addEventListener('touchend',endDrag);
  };


  function getSlide(element) {
    if (!element  || element.classList.contains(CAROUSEL)) {
      return null;
    }
    return element.classList.contains(SLIDE) ? element : getSlide(element.parentNode);
  }

  function focus(slide) {
    if(slide) {
      slide.scrollIntoView();
      slide.focus();
    }
  }


  /**
   * Initialize component
   */
  MaterialExtCarousel.prototype.init = function() {
    //console.log('***** MaterialExtCarousel.init', this.element_.classList, 'data-upgraded', this.element_.getAttribute('data-upgraded'));

    if (this.element_) {
      this.element_.setAttribute('role', ROLE);
      if(!Number.isInteger(this.element_.getAttribute('tabindex'))) {
        this.element_.setAttribute('tabindex', -1);
      }

      [...this.element_.querySelectorAll(`.${SLIDE}`)].forEach( slide => {
        slide.setAttribute('role', SLIDE_ROLE);
        if(!Number.isInteger(slide.getAttribute('tabindex'))) {
          slide.setAttribute('tabindex', 0);
        }
      });

      // Listen to keyboard events
      this.element_.addEventListener('keydown', this.keyDownHandler_.bind(this), true);

      // Listen to custom event
      this.element_.addEventListener('command', this.commandHandler_.bind(this), false);

      // Listen to drag event
      this.element_.addEventListener('mousedown' , this.dragHandler_.bind(this), true);
      this.element_.addEventListener('touchstart', this.dragHandler_.bind(this), true);

      // Click is handled by drag
      this.element_.addEventListener('click'     , e => e.preventDefault(), true);

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
   MaterialExtStickyHeader.prototype.mdlDowngrade_ = function() {
     'use strict';
   };
   */

  // The component registers itself. It can assume componentHandler is available
  // in the global scope.
  /* eslint no-undef: 0 */
  componentHandler.register({
    constructor: MaterialExtCarousel,
    classAsString: 'MaterialExtCarousel',
    cssClass: 'mdlext-js-carousel'
  });
})();
