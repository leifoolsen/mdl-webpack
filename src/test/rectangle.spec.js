'use strict';
import 'babel-polyfill';
import { expect } from 'chai';
import Rectangle from './rectangle';

describe('Rectangle', () => {

  describe('#constructor()', () => {
    it('requires two numerical arguments', () => {
      expect(() => {
        new Rectangle();
      }).to.throw(Error);

      expect(() => {
        new Rectangle(1.0);
      }).to.throw(Error);

      expect(() => {
        new Rectangle('foo', 'bar');
      }).to.throw(Error);

      expect(() => {
        new Rectangle(5, 7);
      }).to.not.throw(Error);
    });
  });

  describe('#height', () => {
    let rectangle;

    beforeEach(() => {
      rectangle = new Rectangle(10, 20);
    });

    it('returns the height', () => {
      expect(rectangle.height).to.be.equal(20);
    });

    it('can be changed', () => {
      rectangle.height = 30;
      expect(rectangle.height).to.be.equal(30);
    });

    it('only accepts numerical values', () => {
      expect(() => {
        rectangle.height = 'foo';
      }).to.throw(Error);
    });

  });

  describe('#width()', () => {
    let rectangle;

    beforeEach(() => {
      rectangle = new Rectangle(10, 20);
    });

    it('returns the width', () => {
      expect(rectangle.width).to.be.equal(10);
    });

    it('can be changed', () => {
      expect(rectangle.width = 30).to.be.equal(30);
    });

    it('only accepts numerical values', () => {
      expect(() => {
        rectangle.width = 'foo';
      }).to.throw(Error);
    });
  });

  describe('#area', () => {
    let rectangle;

    beforeEach(() => {
      rectangle = new Rectangle(10, 20);
    });

    it('returns the area', () => {
      expect(rectangle.area).to.be.equal(200);
    });

    it('can not be changed', () => {
      expect(() => {
        rectangle.area = 1000;
      }).to.throw(Error);
    });
  });

  describe('#circumference', () => {
    let rectangle;

    beforeEach(() => {
      rectangle = new Rectangle(10, 20);
    });

    it('returns the circumference', () => {
      expect(rectangle.circumference).to.be.equal(60);
    });

    it('can not be changed', () => {
      expect(() => {
        rectangle.circumference = 1000;
      }).to.throw(Error);
    });
  });

});
