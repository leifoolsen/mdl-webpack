import chai from 'chai';

chai.expect();

const expect = chai.expect;

var foo;

describe('Given an instance of Foo', function () {
  before(function () {
    foo = new Foo();
  });
  describe('when I need the name', function () {
    it('should return the name', () => {
      expect(foo.name).to.be.equal('bar');
    });
  });
});


class Foo {
  name = 'bar';
}
