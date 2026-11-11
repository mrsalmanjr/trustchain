import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

async function test() {
  try {
    const qrPayload = {
      type: "upi_qr",
      name: "Test Donation",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: 10000,
      description: "Test Donation",
      close_by: Math.floor(Date.now() / 1000) + 900,
      notes: {
        donation_id: "test_123"
      }
    };
    const qr = await razorpayClient.qrCode.create(qrPayload);
    console.log("QR created successfully:", qr);
  } catch (e: any) {
    console.error("QR creation failed:", e.error || e);
  }
}

test();
