# RWA Vault Registry — Schema

`vaults.json` is the curated, hand-verified layer of the RWA vaults overview.
Live numbers (TVL, APY) are enriched at build time by `enrich.py` from DeFiLlama;
the curated fields below are the moat and change rarely.

## Vault object

| Field | Type | Notes |
|---|---|---|
| `id` | string | kebab-case, stable key |
| `name` | string | display name |
| `issuer` | string | legal/brand issuer |
| `asset_class` | enum | `tokenized_treasuries` \| `private_credit` \| `corporate_bonds` \| `gold` \| `tokenized_stocks` \| `basis_yield` \| `reinsurance` |
| `underlying` | string | plain-English: what actually backs it |
| `tokens` | string[] | token symbols |
| `chains` | string[] | chains where the token lives |
| `tvl_usd_approx` | number | snapshot at research time; superseded by enrichment |
| `apy_pct_approx` | number\|null | snapshot; superseded by enrichment |
| `terms.min_investment` | string | "$5M", "$100k", "none" |
| `terms.kyc` | enum | `none` \| `kyc_retail` \| `accredited` \| `qualified_purchaser` \| `institutional_only` |
| `terms.jurisdiction` | string | e.g. "non-US only", "EU retail" |
| `terms.redemption` | string | mechanics + settlement time |
| `terms.lockup` | string | |
| `terms.fees` | string | mgmt fee etc. |
| `access.retail_accessible` | bool | can a normal person get in somewhere |
| `access.how_to_invest` | {method,url}[] | practical entry paths |
| `defillama_slug` | string\|null | join key for live enrichment |
| `yield_profile` | object? | optional: target vs trailing yield, guaranteed flag, notes (for vaults marketing a target) |
| `promotions` | object[]? | optional time-boxed bonus programs: `window.start/end` (page should auto-expire past `end`), `tiers`, `mechanic`, `caveats`, `source` |
| `risk_notes` | string | |
| `sources` | string[] | URLs the terms were verified from |
| `verified_at` | string | ISO date of the research pass |

## Files

- `vaults.json` — curated registry (this repo's source of truth)
- `enrich.py` — joins live DeFiLlama TVL/APY onto the registry → `vaults.enriched.json`

| `cmc` | object? | joined from CoinMarketCap RWA API by `cmc_rwa.py`: `issuer_id`, `issuer_name`, `num_tokens`, `wrappers[]` (token, underlying, premium_pct vs blended tokenized average), `as_of` |

## IXS protocol TVL

`also_available_on[]` lists another deployment route with `chain`, `url`, and a scope note. It does not extend the entry's verified access terms to that route.

For IXS, `live.tvl_scope` is `protocol` and `live.tvl_usd` is the headline IXS TVL: the rwa.io protocol total (`live.tvl_base_usd`, hand-maintained in `ixs_tvl.py` with `live.tvl_base_as_of`; it covers all IXS pools, not only the IXHYB vaults) plus the aggregate IXHYB vault contribution rounded down to the nearest `live.tvl_step_usd` ($10,000) for headline display. Individual deposits start at $100 USDC; headline rounding is not a deposit-size restriction. `live.tvl_source_url` links to https://app.rwa.io/project/ixs-finance. The vault deposits are kept separately: `live.vault_tvl_usd` is the sum of `totalAssets()` on Avalanche and BNB Chain (USDC at $1), `live.vault_tvl_complete` is true only when both reads succeed, and `live.tvl_chains[]` holds chain ID/name, contract, decimals, raw base units, block number, RPC source, USD value and observation time. A failed chain keeps the headline at the base, sets `vault_tvl_usd` to null, and preserves the available breakdown; vault deposits must never display as zero or as a complete partial sum. Update the base number and date together when rwa.io changes.

## DeFiLlama metric scope

`live.tvl_scope` is `protocol` when sourced from `/protocols`, or `project_reference_pool` when falling back to the project's largest yield pool. `live.tvl_source` describes this scope. Neither establishes an individual product's TVL. Enriched APY has `apy_scope: "project_reference_pool"` and an explanatory `apy_source`; matching only the project slug does not verify the named product's yield. Issuer targets take precedence when supplied.
