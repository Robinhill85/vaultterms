# Final checks — VaultTerms

Checked 8 September 2026. Local release candidate on `fix/submission-checks-2026-09-08`; production has not been updated by this task. Public repo and deployed homepage were reachable. The local branch starts from the successful 8 September daily refresh (`1ac6a76`). Framework: static HTML/JavaScript and Python data pipelines.

## Findings and fixes

| Finding | Result and verification |
|---|---|
| IXS product TVL omitted the BNB deployment | Daily enrichment now sums `totalAssets()` on the verified Avalanche and BNB deployments. The source catalog identifies both as `ixhyb`. Each read verifies chain ID and records its block; USDC uses 6 decimals on Avalanche and 18 on BNB. |
| Some product cards showed protocol / reference-pool metrics without scope | Enrichment and the current snapshot now identify protocol TVL and project reference-pool APY; cards label both. Snapshot values and original dates were preserved. These are contextual metrics, not verified product yields or balances. |

IXS snapshot at **22:14:23 UTC**: Avalanche **$401.054476**, BNB **$4,352.081362552608**, combined **$4,753.135838552608**. Displayed as **$4,753.14**. USDC is valued at $1, matching the product-page convention; pending requests are not added separately. A failed chain makes the combined total unavailable, not zero or a partial sum.

BNB availability links to the IXS combined vault page. The existing entry's access terms and rewards remain scoped to Avalanche; users are directed to check BNB-specific conditions. No BNB transaction capability was added.

## Verification

- Eight Python unit tests passed, including chain decimals, measured zero, failed reads, wrong-chain rejection and block pinning.
- Seven JavaScript tests passed, including combined-value failures, scope labels, missing/zero distinctions, freshness and eligibility.
- Python compilation checks passed for enrichment and both new scripts.
- EU + $1,000 + standard KYC produced 14 of 26 matches. Corporate bonds narrowed this to IXS. Reset restored all 26. An issuer's verified-terms link opened its matching xStocks entry.
- Live CMC sections showed 24 issuers and 14 underlying wrapper comparisons. The snapshot contains 26 verified plus 74 separately tracked entries; these counts are not interchangeable.
- Desktop and 390 × 844 mobile previews inspected; no document overflow at phone width. Combined TVL, the per-chain breakdown and BNB link were visible. No console errors returned in the checked local flow. Screenshots were inspected inline in the task.
- Three real successful CMC calls captured with full request/response JSON. [Code and evidence](cmc-evidence.md).
- Most recent three GitHub Actions refresh runs were successful, including the [8 September run](https://github.com/Robinhill85/vaultterms/actions/runs/34187700223).
- Known configured credential values were checked against tracked/new files and git history; none matched. No credential files are tracked. This was a targeted check, not a comprehensive security audit.

## Release conditions and limits

Release this repository before the agent, which consumes its public registry. Check the first post-release refresh and inspect the published JSON for `tvl_complete: true`, both chain entries and current timestamps. If a chain is unavailable, retain the unavailable state and investigate the source.

Record and host a 90–120 second demo, create the DoraHacks entry, and then fill/publish the X draft with actual submission and video links. None of those publication steps was performed in this task. Confirm CMC endpoint access continues through judging; event-window access ends at the submission deadline.

Product-specific APY matching would require explicit pool IDs or issuer data and remains a future data-quality improvement. Current scope labels disclose the existing project-level method. Terms were not re-researched for every one of the 26 entries, and every outbound issuer URL was not tested. This targeted review is not an exhaustive accessibility/performance audit; no numerical health score is claimed.

[Submission copy and demo script](submission-draft.md)

## Fix commits

- `12025c0`: combined Avalanche + BNB TVL, failure handling and regression tests.
- `cfd6e9d`: explicit protocol TVL and project reference-pool APY scope.
