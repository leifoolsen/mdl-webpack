'use strict';

// ES6 introduces "classes". For people familiar with
// object oriented languages such as Java as C++ this
// is nothing out of the ordinary.
// // https://onsen.io/blog/mocha-chaijs-unit-test-coverage-es6/

class Rectangle {
  // The constructor will be executed if you initiate a
  // "Rectangle" object with
  //
  //   new Rectangle(width, height)
  //
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }


  // This is also a new feature of ES6. The "get" keyword
  // is used to define a "getter".
  //
  // This means that if you access the "height" like this:
  //
  //   let rectangle = new Rectangle(5, 7);
  //   console.log(rectangle.width);
  //
  // The code below will be executed.
  get height() {
    return this._height;
  }

  // This defines a "setter". If you write something like:
  //
  //   let rectangle = new Rectangle(5, 7);
  //   rectangle.height = 10;
  //
  // the code in the method will be executed with an
  // argument of value 10.
  set height(value) {
    if (typeof value !== 'number') {
      throw new Error('"height" must be a number.');
    }

    this._height = value;
  }

  get width() {
    return this._width;
  }

  set width(value) {
    if (typeof value !== 'number') {
      throw new Error('"width" must be a number.');
    }

    this._width = value;
  }

  // This getter calculates the area of the rectangle.
  get area() {
    return this.width * this.height;
  }

  // This calculates its circumference.
  get circumference() {
    return 2 * this.width + 2 * this.height;
  }
}

// We export the Rectangle class so it can
// be require()'d in other files.
export default Rectangle;

