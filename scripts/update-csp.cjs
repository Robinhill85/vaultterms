// Run after changing the inline app script in ledger/index.html.
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const html = fs.readFileSync('ledger/index.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (scripts.length !== 1) throw new Error('Expected one inline app script; review the CSP before continuing.');
const hash = createHash('sha256').update(scripts[0][1]).digest('base64');
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const csp = config.headers.flatMap(rule => rule.headers).find(header => header.key === 'Content-Security-Policy');
if (!csp || !/'sha256-[^']+'/.test(csp.value)) throw new Error('Expected a hash-based CSP.');
csp.value = csp.value.replace(/'sha256-[^']+'/g, `'sha256-${hash}'`);
fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2) + '\n');
console.log('Updated CSP to allow the current inline app script.');
