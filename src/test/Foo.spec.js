//import chai from 'chai';
//const expect = chai.expect;
//import { expect } from 'chai';

var foo;

describe('Given an instance of Foo', () => {
  before( () => {
    foo = new Foo();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(foo.name).to.be.equal('bar');
    });
  });
});


class Foo {
  _name = 'bar';
  get name() { return this._name; }
}
