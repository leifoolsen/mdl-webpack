class MdlExtAnimationLoop {

  constructor(interval = 17) {

    this.interval     = interval;
    this.running_     = false;
    this.rAFId_       = 0;
    this.timeElapsed_ = 0;
  }

  set interval(interval) {
    this.interval_ = interval < 17 ? 17 : interval;  // 17 ~ 60fps
  }

  get running() {
    return this.running_;
  }

  cancelRAF() {
    if(this.rAFId_ !== 0) {
      window.cancelAnimationFrame(this.rAFId_);
      this.rAFId_ = 0;
    }
    this.running_     = false;
    this.timeElapsed_ = 0;
  }

  start( tick ) {
    this.running_ = true;
    let timeStart = Date.now();

    const loop = now => {
      if (this.running_) {
        this.rAFId_ = window.requestAnimationFrame( () => loop( Date.now() ));
        this.timeElapsed_ += now - timeStart;

        if(this.timeElapsed_ >= this.interval_) {
          this.running_ = tick( this.timeElapsed_ );
          if( (this.timeElapsed_ -= this.interval_) > this.interval_) {
            // time elapsed - interval > interval , indicates inactivity
            // Could be due to browser minimized, tab changed, screen saver started, computer sleep, and so on
            this.timeElapsed_ = 0;
          }
        }
        timeStart = now;
      }
    };
    loop(timeStart);
    return this;
  }

  stop() {
    this.cancelRAF();
  }
}

export default MdlExtAnimationLoop;
