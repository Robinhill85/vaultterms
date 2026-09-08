const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const script=fs.readFileSync('ledger/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/loadData\(\);\s*$/,'');
const context=vm.createContext({document:{getElementById:()=>({addEventListener(){}}),addEventListener(){}},Date,URL,console});
vm.runInContext(script,context);
test('incomplete combined TVL cannot fall back to an estimate or partial total',()=>{
 context.fixture={live:{tvl_scope:'combined',tvl_complete:false,tvl_usd:100,as_of:null,tvl_source:'Onchain'},tvl_usd_approx:999};
 assert.equal(vm.runInContext('tvlOf(fixture).n',context),null);
 assert.equal(vm.runInContext('tvlOf(fixture).source',context),'Onchain');
});
test('complete combined zero preserves the measurement and source',()=>{
 context.fixture={live:{tvl_scope:'combined',tvl_complete:true,tvl_usd:0,as_of:'2026-09-08',tvl_source:'Onchain'}};
 assert.equal(vm.runInContext('tvlOf(fixture).n',context),0);
});
test('protocol TVL and reference pool APY retain their scope on product cards',()=>{
 const fixture=JSON.parse(fs.readFileSync('registry/vaults.enriched.json','utf8')).find(v=>v.id==='ondo-ousg');
 assert.ok(fixture, 'Ondo fixture exists');
 context.fixture=fixture;
 const html=vm.runInContext('vaultHtml(fixture)',context);
 assert.match(html,/Protocol TVL/);
 assert.match(html,/DeFiLlama protocol total/);
 if(!fixture.yield_profile?.target_pct) assert.match(html,/Reference pool APY/);
});
