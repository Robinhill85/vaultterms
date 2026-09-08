"""Regression: combined TVL must preserve decimals, zero, and failed reads."""
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "registry"))
from ixs_tvl import combined_tvl, read_deployment, DEPLOYMENTS


def reading(deployment, amount):
    return {**deployment, "base_units": str(amount),
            "tvl_usd": amount / 10 ** deployment["decimals"],
            "as_of": "2026-09-08T12:00:00+00:00"}


class CombinedTvlTests(unittest.TestCase):
    def test_chain_specific_usdc_decimals(self):
        amounts = {43114: 100_000_000, 56: 250 * 10**18}
        result = combined_tvl(lambda d: reading(d, amounts[d["chain_id"]]))
        self.assertEqual(result["tvl_usd"], 350)
        self.assertTrue(result["tvl_complete"])

    def test_zero_is_a_complete_measurement(self):
        result = combined_tvl(lambda d: reading(d, 0))
        self.assertEqual(result["tvl_usd"], 0)
        self.assertTrue(result["tvl_complete"])

    def test_missing_chain_never_becomes_partial_total(self):
        result = combined_tvl(lambda d: reading(d, 100_000_000) if d["chain_id"] == 43114
                              else {"tvl_usd": None, "as_of": None})
        self.assertIsNone(result["tvl_usd"])
        self.assertIsNone(result["as_of"])
        self.assertFalse(result["tvl_complete"])

    def test_wrong_chain_is_rejected(self):
        with patch("ixs_tvl.rpc", return_value="0x1"):
            self.assertIsNone(read_deployment(DEPLOYMENTS[0])["tvl_usd"])

    def test_reads_are_pinned_to_block(self):
        with patch("ixs_tvl.rpc", side_effect=["0xa86a", "0x100", "0x" + format(123_000_000, "064x")]) as rpc:
            result = read_deployment(DEPLOYMENTS[0])
        self.assertEqual(result["tvl_usd"], 123)
        self.assertEqual(result["block_number"], 256)
        self.assertEqual(rpc.call_args.args[2][-1], "0x100")


if __name__ == "__main__":
    unittest.main()
