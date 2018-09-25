const expect = require('chai').expect;
const { PathAndNameObj } = require('../../src/composables');

describe('factory to create PathAndNameObj. it has Path and Name property', ()=>{
  it('should create obj with path and name with both of the props or one of them', () => {
    const namedObj = PathAndNameObj({name:'name'});
    expect(namedObj.name).to.eq('name');
    expect(namedObj.path).to.eq(null);
    const pathObj1 = PathAndNameObj({path:'path'});
    expect(pathObj1.name).to.eq('path');
    expect(pathObj1.path).to.eq('path');
    const pathObj2 = PathAndNameObj({path:'path1.path2.path3.'});
    expect(pathObj2.name).to.eq('path3');
    expect(pathObj2.path).to.eq('path1.path2.path3');
    expect(PathAndNameObj({name:'name', parentPath: 'asfd.path.s'}))
      .to.eql({name:'name', path: 'asfd.path.s.name'});
  });
  it('should throw exception if either the name or the path cannot be set up', ()=>{
    expect(()=>PathAndNameObj()).to.throw();
    expect(()=>PathAndNameObj({path:'.'})).to.throw();
    expect(()=>PathAndNameObj({name:''})).to.throw();
    expect(()=>PathAndNameObj({name:'name1.name2'})).to.throw();
  });
});
