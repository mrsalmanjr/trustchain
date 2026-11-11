import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { ethers } from 'ethers';

dotenv.config();

async function testConnections() {
  console.log("Starting connection tests...\n");

  // 1. Test Supabase
  console.log("=== Testing Supabase ===");
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    console.log("❌ Supabase: Missing or default credentials in .env");
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Just check if we can query anything, or if it throws on an invalid key.
      // Trying to fetch 1 row from a non-existent or existing table
      const { error } = await supabase.from('users').select('id').limit(1);
      // If error code is 'PGRST116' (no rows) or null, it connected. If it's 401/403, auth failed.
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        console.log("❌ Supabase Error:", error.message);
      } else {
        console.log("✅ Supabase: Connected successfully!");
      }
    } catch (e: any) {
      console.log("❌ Supabase Exception:", e.message);
    }
  }

  console.log("\n=== Testing Razorpay ===");
  const rzpId = process.env.RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

  if (!rzpId || !rzpSecret || rzpId.includes('your_key_id')) {
    console.log("❌ Razorpay: Missing or default credentials in .env");
  } else {
    try {
      const instance = new Razorpay({ key_id: rzpId, key_secret: rzpSecret });
      // Fetch 1 order to verify auth
      await instance.orders.all({ count: 1 });
      console.log("✅ Razorpay: Connected successfully!");
    } catch (e: any) {
      console.log("❌ Razorpay Error:", e.error ? e.error.description : e.message);
    }
  }

  console.log("\n=== Testing Blockchain ===");
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

  if (!rpcUrl || !privateKey || privateKey.includes('your-wallet')) {
    console.log("❌ Blockchain: Missing or default credentials in .env");
  } else {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      console.log(`✅ Blockchain: Connected to network ${network.name} (Chain ID: ${network.chainId})`);
      console.log(`✅ Blockchain: Current Block Number is ${blockNumber}`);
      console.log(`✅ Blockchain: Wallet Address is ${wallet.address}`);
    } catch (e: any) {
      console.log("❌ Blockchain Error:", e.message);
    }
  }

  console.log("\nTests finished.");
}

testConnections();
