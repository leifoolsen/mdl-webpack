describe('mocha-jsdom tests', function () {

  it('has document', () => {
    const div = document.createElement('div')
    expect(div.nodeName).eql('DIV')
  })

  it('works', function () {
    document.body.innerHTML = '<div>hola</div>'
    const div = document.getElementsByTagName('div')[0]
    expect(div.innerHTML).eql('hola')
  })

})
