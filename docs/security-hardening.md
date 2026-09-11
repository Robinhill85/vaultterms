# Security controls

Reviewed 11 September 2026. This is an application review, not a security certification or an audit of listed vault contracts.

- Registry text and HTML attributes are escaped before rendering. Feed links accept only HTTP(S) URLs without embedded credentials.
- Vercel sends a Content Security Policy that permits the exact inline application script and same-origin resources, blocks arbitrary inline scripts and prevents framing. Inline styles remain permitted for the existing layout.
- The daily refresh workflow uses pinned GitHub Action commits and a 15-minute timeout. Its API credentials stay in GitHub Actions secrets; the deployed ledger is static.
- GitHub secret scanning, push protection, vulnerability alerts and automated security updates are enabled.

After editing the inline script in `ledger/index.html`, run:

```sh
node scripts/update-csp.cjs
node --test tests/*.test.cjs
python3 -m unittest discover -s tests
```

The CSP test checks that the script hash matches `vercel.json`. A stale hash prevents the app from running. Daily JSON data refreshes do not change the script hash.

Treat external feeds as untrusted. Escaping prevents execution; it does not establish the accuracy or safety of financial products or external websites.
