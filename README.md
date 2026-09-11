# VaultTerms (vaultterms.com)

Curated registry + live data pipeline behind vaultterms.com — an overview of RWA vaults:
what backs each vault, who can invest, on what terms, and where.

## Status (Sep 8, 2026)

- `registry/vaults.json` — 26 vaults, hand-verified from official issuer docs (research pass 2026-09-01)
- `registry/vaults.enriched.json` — registry + live DeFiLlama TVL/APY (`python3 registry/enrich.py`)
- `registry/cmc_issuers.json`, `cmc_assets.json`, `cmc_premiums.json`, `cmc_calls.json` — CoinMarketCap RWA layer (`python3 registry/cmc_rwa.py`)
- `registry/SCHEMA.md` — field reference
- `registry/_batch_*.json` — raw research batches (provenance; vaults.json is the merge)

## Coverage

12 tokenized treasuries, 6 private credit, 1 corporate bonds (IXS/SHYG on
Avalanche, also available on BNB), 2 gold, 2 tokenized stocks, 2 basis-yield, 1 reinsurance.
16 of 26 retail-accessible somewhere.
Goldfinch Prime included as winding-down (historical/cautionary; not investable).
Every entry follows the same standard: terms checked against official issuer documents, with source links provided.

## #BuildwithCMC — Real World Assets track

VaultTerms v2 adds a CoinMarketCap Real-World Assets layer on top of the hand-verified registry (`registry/cmc_rwa.py`, run daily by the same cron):

| CMC endpoint | What VaultTerms does with it |
|---|---|
| `GET /v5/real-world-assets/issuers/list` | **Issuer explorer** — every RWA token issuer CMC tracks, joined to the vaults on this ledger that carry verified terms |
| `GET /v5/real-world-assets/assets/list` (`asset_type`, `sort=tokenized_market_cap&sort_dir=desc`) | **Tokenized assets tier** — sizes stocks / commodities / ETFs, categories no DeFi TVL tracker models |
| `GET /v5/real-world-assets/quotes/latest` | **Wrapper premiums** — each issuer's tokenized price vs the blended average (xStocks, Ondo, Robinhood, PAXG vs XAUT…), shown on the relevant vault cards |

Evidence of real calls (code + responses + the daily public call log `registry/cmc_calls.json`): [`docs/cmc-evidence.md`](docs/cmc-evidence.md). The CMC key is a GitHub Actions secret and never committed. Everything CMC-related was built for the hackathon (commits from 2026-09-03 onward); the registry, tracked tier and eligibility desk pre-date it and are disclosed as such.

## Data layers

1. **Curated (the moat):** underlying assets, KYC tier, jurisdiction, minimums,
   redemption mechanics, fees, how-to-invest paths — verified against issuer docs.
2. **Live:** DeFiLlama protocols + yields APIs (free, no key) via `enrich.py`.
   Franklin BENJI has no DeFiLlama entry (slug null) — use rwa.xyz if needed.
3. **CoinMarketCap RWA API:** issuers, tokenized-asset categories, wrapper premiums (`registry/cmc_rwa.py`, ~9 credits/day).

## Run locally

```bash
python3 -m http.server 8000
# Open http://localhost:8000/ledger/
python3 -m unittest discover -s tests -v
node --test tests/*.test.cjs
```

The deployed root is rewritten to `ledger/index.html` by Vercel. GitHub Actions refreshes the data daily.

## IXS protocol TVL

IXS reports protocol-level TVL across its pools, not just the two IXHYB vaults, so the ledger shows the [rwa.io](https://app.rwa.io/project/ixs-finance) protocol total ($88.45M, hand-maintained in `registry/ixs_tvl.py` with its reference date) plus the aggregate IXHYB vault contribution rounded down to the nearest $10,000 for headline display. Individual deposits start at $100 USDC; headline rounding is not a deposit-size restriction. The vault deposits are read onchain daily by `ixs_tvl.py` (`totalAssets()` on the Avalanche and BNB deployments, USDC at $1, each reading pinned to chain, contract, block and time) and shown per chain under the headline. A failed chain keeps the base and marks vault deposits unavailable. `enrich.py` runs this as part of the daily refresh.

The verified terms remain scoped to Avalanche; BNB is explicitly linked as another available route, whose terms and reward eligibility should be checked separately.

## Submission materials

- [Draft submission and demo script](docs/submission-draft.md)
- [Final check report](docs/final-checks-2026-09-08.md)
