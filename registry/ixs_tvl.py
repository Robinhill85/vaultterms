"""IXHYB product TVL: totalAssets on Avalanche + BNB, as on the IXS product page.

Deployment identities verified against the public IXS vault catalog on 2026-09-08:
https://api-v2.ixs.finance/vaults?requiresWhitelist=false (productId: ixhyb).
USDC is valued at $1; pending requests are not added separately.
"""
import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from decimal import Decimal

DEPLOYMENTS = (
    {"chain": "Avalanche", "chain_id": 43114,
     "contract": "0xaD01573b459805E3954398796203d830B57A8bD9", "decimals": 6,
     "rpcs": ("https://api.avax.network/ext/bc/C/rpc", "https://avalanche-c-chain-rpc.publicnode.com")},
    {"chain": "BNB Chain", "chain_id": 56,
     "contract": "0xc975a3EeF2e49F8eDdEf585340C43f15300fCB82", "decimals": 18,
     "rpcs": ("https://bsc-rpc.publicnode.com", "https://bsc-dataseed.bnbchain.org")},
)


def rpc(url, method, params):
    req = urllib.request.Request(url, json.dumps({"jsonrpc": "2.0", "id": 1,
        "method": method, "params": params}).encode(),
        {"Content-Type": "application/json", "User-Agent": "VaultTerms/1.0"})
    with urllib.request.urlopen(req, timeout=12) as response:
        body = json.load(response)
    result = body.get("result")
    if body.get("error") or not isinstance(result, str) or not re.fullmatch(r"0x[0-9a-fA-F]+", result):
        raise ValueError("Invalid RPC result")
    return result


def read_deployment(deployment):
    row = {k: deployment[k] for k in ("chain", "chain_id", "contract", "decimals")}
    for url in deployment["rpcs"]:
        try:
            if int(rpc(url, "eth_chainId", []), 16) != deployment["chain_id"]:
                raise ValueError("Wrong chain")
            block = rpc(url, "eth_blockNumber", [])
            # totalAssets() selector, pinned to the reported block.
            raw = rpc(url, "eth_call", [{"to": deployment["contract"], "data": "0x01e1d114"}, block])
            if len(raw) != 66:
                raise ValueError("Invalid uint256")
            amount = Decimal(int(raw, 16)) / (Decimal(10) ** deployment["decimals"])
            return {**row, "tvl_usd": float(amount), "base_units": str(int(raw, 16)),
                    "block_number": int(block, 16), "rpc_url": url,
                    "as_of": datetime.now(timezone.utc).isoformat(timespec="seconds")}
        except Exception:
            continue
    return {**row, "tvl_usd": None, "as_of": None, "error": "Onchain read unavailable"}


def combined_tvl(reader=read_deployment):
    with ThreadPoolExecutor(max_workers=2) as pool:
        rows = list(pool.map(reader, DEPLOYMENTS))
    complete = all(row.get("tvl_usd") is not None for row in rows)
    return {
        "tvl_usd": float(sum(Decimal(row["base_units"]) / (Decimal(10) ** row["decimals"])
                             for row in rows)) if complete else None,
        "as_of": min(row["as_of"] for row in rows) if complete else None,
        "tvl_source": "Onchain · Avalanche + BNB Chain",
        "tvl_scope": "combined",
        "tvl_method": "Sum of totalAssets() across both deployments; USDC valued at $1. Pending requests not added separately.",
        "tvl_complete": complete,
        "tvl_chains": rows,
    }
