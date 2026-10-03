import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      
    },
    orderId: {
      type: String,
      required: true,
    
    },
    paymentId: String,
    amount: Number,
    currency: {
      type: String,
      default: "INR",
    },
    credits: Number,
    plan: String,

    // Money state
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    
  },
  { timestamps: true },
);

const Payment = mongoose.model("payment", paymentSchema);
export default Payment;
