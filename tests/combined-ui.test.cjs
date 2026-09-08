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
