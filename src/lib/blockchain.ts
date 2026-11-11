import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Contract ABI (matching TrustChainLedger.sol)
const contractABI = [
  "function recordDonation(string memory _donationId, string memory _campaignId, uint256 _amount) public",
  "function getDonation(string memory _donationId) public view returns (string memory, string memory, uint256, uint256)",
  "event DonationRecorded(string indexed donationId, string indexed campaignId, uint256 amount, uint256 timestamp)"
];

export const isBlockchainConfigured = !!process.env.BLOCKCHAIN_RPC_URL && !!process.env.BLOCKCHAIN_PRIVATE_KEY && !!process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

export let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

if (isBlockchainConfigured) {
  provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
  wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY!, provider);
  contract = new ethers.Contract(process.env.BLOCKCHAIN_CONTRACT_ADDRESS!, contractABI, wallet);
}

export const recordDonationOnChain = async (donationId: string, campaignId: string, amount: number): Promise<string> => {
  if (!isBlockchainConfigured || !contract) {
    throw new Error("Blockchain is not configured");
  }

  try {
    // Note: In production, you might want to convert amount to smallest denomination (e.g. Wei)
    // Here we are simply passing the number since it's an integer tracking rupees in our smart contract.
    const tx = await contract.recordDonation(donationId, campaignId, Math.floor(amount));
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error("Blockchain transaction failed:", error);
    throw error;
  }
};

export const getTransactionDetails = async (txHash: string) => {
  if (!isBlockchainConfigured || !provider || !txHash || !txHash.startsWith("0x")) return null;
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) return null;
    const block = await provider.getBlock(receipt.blockNumber);
    return {
      blockNumber: receipt.blockNumber,
      timestamp: block ? new Date(block.timestamp * 1000).toISOString() : null,
      blockHash: receipt.blockHash,
      from: receipt.from,
      to: receipt.to
    };
  } catch (error) {
    console.error(`Failed to fetch tx details for ${txHash}:`, error);
    return null;
  }
};
