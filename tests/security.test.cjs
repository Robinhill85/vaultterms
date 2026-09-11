const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const html=fs.readFileSync('ledger/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const context=vm.createContext({document:{getElementById:()=>({addEventListener(){}}),addEventListener(){}},Date,URL,console});
vm.runInContext(script.replace(/loadData\(\);\s*$/,''),context);
test('feed links only allow ordinary HTTP(S) URLs',()=>{
 for(const url of ['javascript:alert(1)','java\nscript:alert(1)','data:text/html,<script>alert(1)</script>','https://name:password@example.com','//example.com','not a URL']) {
  context.url=url;assert.equal(vm.runInContext('safeHref(url)',context),'#');
 }
 context.url='https://example.com/?a=1&b=2';assert.equal(vm.runInContext('safeHref(url)',context),'https://example.com/?a=1&amp;b=2');
});
test('registry attributes, chain names and issuer counts are escaped before HTML insertion',()=>{
 const fixture=JSON.parse(fs.readFileSync('registry/vaults.enriched.json','utf8'))[0];
 context.fixture={...fixture,id:'x" onmouseover="alert(1)',chains:['<img src=x onerror=alert(1)>'],cmc:{num_tokens:'<svg onload=alert(1)>'}};
 const rendered=vm.runInContext('vaultHtml(fixture)',context);
 assert.ok(!rendered.includes('<img'));
 assert.ok(!rendered.includes('<svg'));
 assert.ok(rendered.includes('id="v-x&quot; onmouseover=&quot;alert(1)"'));
});
test('deployed CSP permits the exact application script while blocking arbitrary inline scripts and framing',()=>{
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
 const headers=config.headers[0].headers;
 const csp=headers.find(h=>h.key==='Content-Security-Policy').value;
 assert.ok(csp.includes("'sha256-"+createHash('sha256').update(script).digest('base64')+"'"));
 assert.match(csp,/frame-ancestors 'none'/);
 assert.ok(!csp.split('script-src ')[1].split(';')[0].includes('unsafe-inline'));
 assert.ok(!/\sonclick=/.test(html));
});
