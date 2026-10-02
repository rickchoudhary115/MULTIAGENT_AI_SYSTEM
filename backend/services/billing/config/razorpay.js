import dotenv from "dotenv";
dotenv.config({ override: true });
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY, // fixed typo: was SECRETE
});

export default razorpay;
