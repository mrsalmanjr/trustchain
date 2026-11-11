import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const client = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

async function run() {
  try {
    const order = await client.orders.create({
      amount: 100 * 100,
      currency: "INR",
      receipt: "test_receipt"
    });
    console.log("Success:", order);
  } catch (e: any) {
    console.error("Error:", e.error || e);
  }
}
run();
