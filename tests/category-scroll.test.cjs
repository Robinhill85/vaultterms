const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const script=fs.readFileSync('ledger/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/loadData\(\);\s*$/,'');
const vaults=JSON.parse(fs.readFileSync('registry/vaults.enriched.json','utf8'));

function page({barHeight=87,reducedMotion=false}={}){
  const elements=new Map(), frames=[], scrolls=[];
  let focused;
  const window={scrollY:16000,matchMedia:()=>({matches:reducedMotion}),scrollTo:options=>scrolls.push(options)};
  const getElement=id=>{
    if(!elements.has(id))elements.set(id,{
      innerHTML:'',textContent:'',listeners:{},classList:{toggle(){}},
      selectedOptions:[{text:'None — wallet only'}],
      addEventListener(type,handler){this.listeners[type]=handler;},
      getBoundingClientRect:()=>({top:800-window.scrollY}),
    });
    return elements.get(id);
  };
  const context=vm.createContext({
    document:{getElementById:getElement,addEventListener(){},querySelector:selector=>
      selector==='.filter-bar'?{getBoundingClientRect:()=>({height:barHeight})}:
      {focus:()=>{focused=selector;}},
    },
    window,requestAnimationFrame:callback=>frames.push(callback),Date,URL,console,vaults,
  });
  const run=code=>vm.runInContext(code,context);
  vm.runInContext(script,context);
  run('VAULTS=vaults;render()');
  return {
    run,window,scrolls,getElement,
    get focused(){return focused;},
    click(key){getElement('rail').listeners.click({target:{closest:()=>({dataset:{k:key}})}});},
    paint(){frames.splice(0).forEach(callback=>callback());},
  };
}

test('category clicks bring the rendered results below the sticky bar from deep in the page',()=>{
  const p=page();
  for(const [key,heading] of [['corporate_bonds','Corporate bonds'],['gold','Gold'],['all','Tokenized treasuries'],['all','Tokenized treasuries']]){
    p.window.scrollY=16000;
    p.click(key);
    assert.match(p.getElement('ledger').innerHTML,new RegExp(`<h2>${heading}</h2>`));
    if(key!=='all')assert.equal((p.getElement('ledger').innerHTML.match(/<h2>/g)||[]).length,1);
    assert.equal(p.focused,`[data-k="${key}"]`);
    // The document shrinks and the browser adjusts scroll before the next frame.
    p.window.scrollY=5000;
    p.paint();
    assert.equal(p.scrolls.at(-1).top,800-87-16);
    assert.equal(p.scrolls.at(-1).behavior,'smooth');
  }
  assert.equal(p.scrolls.length,4,'Selecting the active category also returns to its results');
});

test('empty category results remain visible without clearing eligibility filters',()=>{
  const p=page({barHeight:144});
  p.run('state.kyc="none"');
  p.click('gold');
  p.paint();
  assert.match(p.getElement('ledger').innerHTML,/No verified vaults match/);
  assert.equal(p.run('state.kyc'),'none');
  assert.equal(p.scrolls[0].top,800-144-16,'Wrapped mobile filter chips determine the offset');
});

test('reduced motion skips the animation and ordinary rendering does not scroll',()=>{
  const p=page({reducedMotion:true});
  p.paint();
  assert.equal(p.scrolls.length,0);
  p.click('corporate_bonds');
  p.paint();
  assert.equal(p.scrolls[0].behavior,'instant');
});
