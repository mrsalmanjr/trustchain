import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const contractABI = [
  "event DonationRecorded(string indexed donationId, string indexed campaignId, uint256 amount, uint256 timestamp)"
];

async function test() {
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
  const contract = new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS!, contractABI, provider);
  
  const events = await contract.queryFilter("DonationRecorded", -1000, "latest");
  console.log("Found", events.length, "events");
  if (events.length > 0) {
    console.log(events[0].args);
  }
}
test().catch(console.error);
