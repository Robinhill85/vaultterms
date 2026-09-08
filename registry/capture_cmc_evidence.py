"""Capture real CMC requests and full JSON responses without recording the API key.

CMC_API_KEY=... python3 registry/capture_cmc_evidence.py
Writes docs/evidence/cmc-live.json. Records the credits CMC reports for each call.
"""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://pro-api.coinmarketcap.com/v5/real-world-assets"


def capture():
    key = os.environ["CMC_API_KEY"]
    calls = []
    for endpoint, params in (
        ("/assets/list", {"asset_type": "stock", "limit": 5, "sort": "tokenized_market_cap", "sort_dir": "desc"}),
        ("/quotes/latest", {"symbol": "NVDA,GOLD", "skip_invalid": "true"}),
        ("/issuers/list", {"limit": 5, "active": "true"}),
    ):
        url = BASE + endpoint + "?" + urllib.parse.urlencode(params)
        request = urllib.request.Request(url, headers={"X-CMC_PRO_API_KEY": key, "Accept": "application/json"})
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.load(response)
            status = response.status
        if int(body.get("status", {}).get("error_code", -1)) != 0:
            raise RuntimeError("CMC call did not succeed")
        calls.append({"request": {"method": "GET", "url": url, "auth_header": "X-CMC_PRO_API_KEY (redacted)"},
                      "http_status": status, "response": body})
    out = Path(__file__).resolve().parents[1] / "docs/evidence/cmc-live.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"captured_at": datetime.now(timezone.utc).isoformat(), "calls": calls}, indent=2) + "\n")
    print(f"Captured {len(calls)} successful CMC calls -> {out.name}")


if __name__ == "__main__":
    capture()
