# VaultTerms

Track: **Real World Assets**

Tagline: Tokenized-asset market data connected to the terms that determine who can invest.

Demo: https://vaultterms.com

Repository: https://github.com/Robinhill85/vaultterms

Video: **add the hosted demo URL before submitting**

## Submission description

Two products can give exposure to the same underlying asset while admitting different investors, charging different fees and offering different exits. A market-cap table does not explain those differences.

VaultTerms connects CoinMarketCap's RWA issuer and wrapper data with a curated registry of access terms. Users can compare tokenized stocks, commodities and ETFs, inspect issuer-specific wrapper prices, and follow matched issuers into verified terms. The Eligibility Desk filters the verified registry by region, ticket size and KYC tolerance. Terms include underlying exposure, minimum investment, redemption, fees, risks and source links.

At the 8 September snapshot, the site contains 26 verified entries and a separate set of 74 tracked protocols. It distinguishes verified terms from market-data-only coverage, target yields from reported figures, and missing values from measured zero. CMC data is refreshed daily, with source dates visible. IXS product TVL is read separately from its Avalanche and BNB deployments and shown with a breakdown.

## CMC integration and evidence

The daily pipeline calls these GET endpoints under `https://pro-api.coinmarketcap.com`:

- `/v5/real-world-assets/assets/list`, for tokenized categories and asset rankings.
- `/v5/real-world-assets/quotes/latest`, for per-issuer wrapper prices relative to CMC's blended tokenized average.
- `/v5/real-world-assets/issuers/list`, for issuer discovery and links to verified entries.

[Pipeline code](../registry/cmc_rwa.py), [capture script](../registry/capture_cmc_evidence.py), [full real responses](evidence/cmc-live.json), and [daily call log](../registry/cmc_calls.json).

CMC made it possible to connect issuer discovery and tokenized pricing to practical access research. The API does not provide vault terms, APY or TVL, which remain separate data layers. Some categories return no assets; missing prices and wrapper unit differences require care. The comparison is against a blended tokenized price, not a verified stock-exchange reference or a tradable arbitrage signal.

## Original work and shared components

The verified registry, Eligibility Desk and tracked layer pre-date the CMC integration. The issuer explorer, tokenized category layer, wrapper comparison and CMC pipeline were added for this event starting on 3 September 2026. Will RWA let me in? is a separate AI Agents and Automation entry that consumes this shared registry. This entry demonstrates the research interface and data pipeline. IXS is a client of the author and its entry carries that disclosure.

## Demo script: about 100 seconds

| Time | Screen and narration |
|---|---|
| 0–10s | Homepage: “The same asset can have very different entry rules. VaultTerms puts the market data beside those rules.” |
| 10–30s | Jump to Issuers. Show a matched issuer such as Backed or Ondo and the verified-terms link. |
| 30–50s | Show NVDA or gold wrappers. Explain the blended average and timestamp; show that extreme or missing values are excluded. |
| 50–65s | Show the public CMC request, successful response and pipeline code. Name the three endpoints. |
| 65–85s | Apply EU, $1,000 and basic KYC. Open one matched entry's terms and sources. Distinguish the verified and tracked counts. |
| 85–100s | Show the combined IXS TVL as a separately sourced example, then the public repo. “CMC supplies pricing and issuer discovery; VaultTerms adds the access terms.” |

## X draft

Built VaultTerms: CMC tokenized-asset prices and issuers alongside verified vault terms. Filter by region, budget and KYC, then inspect the underlying and exit rules.

Build: [DORAHACKS_URL]
Demo: [VIDEO_URL]
#BuildwithCMC

Replace both placeholders with actual URLs after publishing the DoraHacks entry. This draft has not been posted.
