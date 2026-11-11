import { recordDonationOnChain } from "./src/lib/blockchain.ts";

async function test() {
  try {
    const txHash = await recordDonationOnChain("test_don_123", "test_camp_123", 100);
    console.log("Success! Tx hash:", txHash);
  } catch (err) {
    console.error("Blockchain error:", err);
  }
}
test();
