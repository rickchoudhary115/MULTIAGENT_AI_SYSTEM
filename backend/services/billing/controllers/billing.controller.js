import crypto from "crypto";
import axios from "axios";

import { PLANS } from "../config/Plans.js";
import razorpay from "../config/razorpay.js";
import Payment from "../model/payment.model.js";

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        message: "User ID is required",
      });
    }

    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(selectedPlan.amount * 100),
      currency: "INR",
      receipt: `receipt-${Date.now()}`,
    });

    console.log("Razorpay order created:", order.id);

    const payment = await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: "created",
    });

    console.log("Payment saved:", payment._id);

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      order,
      plan: selectedPlan,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment verification details",
      });
    }
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }
    console.log("Razorpay signature verified");
    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Prevent duplicate processing
    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    // Update payment
    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;

    await payment.save();

    console.log("Payment updated:", {
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      userId: payment.userId,
      plan: payment.plan,
      credits: payment.credits,
    });

    // Update user's plan and credits
    const authUrl = `${process.env.AUTH_SERVICE}/update-plan`;

    console.log("Updating Auth service:", authUrl);

    const authResponse = await axios.post(authUrl, {
      userId: payment.userId,
      plan: payment.plan,
      credits: payment.credits,}
    ,{
    headers: {
      Cookie: req.headers.cookie || "",
    },
  });

    console.log("Auth service response:", authResponse.data);

    return res.status(200).json({
      success: true,
      message: "Payment verification successful",
      user: authResponse.data.user,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Payment verification failed",
      error: error.response?.data || error.message,
    });
  }
};
