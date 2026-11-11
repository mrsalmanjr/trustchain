import { getTransactionDetails } from "./src/lib/blockchain.ts";

async function test() {
  const hash = "0x4ab495a3b226365dbff1bb0542786e417e6cf3fe691023288ed8035ed3764143";
  const details = await getTransactionDetails(hash);
  console.log("Tx details:", details);
}
test().catch(console.error);
