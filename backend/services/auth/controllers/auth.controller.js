import { getAuth } from "firebase-admin/auth";
import User from "../models/user.model.js";
import { app } from "../config/firebase.js";
import crypto from "crypto";
import redis from "../../../shared/redis/redis.js";

export const login = async (req, res) => {
  try {
    const { token } = req.body;

    const decodedToken = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
      firebaseId: decodedToken.uid,
    });

    if (!user) {
      user = await User.create({
        firebaseId: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        avatar: decodedToken.picture,
      });
    }

    const sessionId = crypto.randomUUID();

    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      }),
      "EX",
      7 * 24 * 60 * 60,
    );

    res.cookie("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(200).json({
        message: "Already logged out",
      });
    }

    await redis.del(`session:${sessionId}`);

    res.clearCookie("session");

    return res.status(200).json({
      message: "logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Error during logout",
      error: error.message,
    });
  }
};

export const updateUserPayment = async (req, res) => {
  try {
    const { plan, credits, userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!plan || credits === undefined) {
      return res.status(400).json({
        message: "Plan and credits are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update MongoDB
    user.plan = plan;
    user.credits += Number(credits);
    user.totalCredits += Number(credits);

    // 30 days plan validity
    user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    // Update Redis session
    const sessionId = req.cookies?.session;

    if (sessionId) {
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify({
          userId: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          plan: user.plan,
          credits: user.credits,
          totalCredits: user.totalCredits,
          planExpiresAt: user.planExpiresAt,
        }),
        "EX",
        7 * 24 * 60 * 60,
      );
    }

    return res.status(200).json({
      success: true,
      message: "User payment updated successfully",
      user: {
        id: user._id,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt,
      },
    });
  } catch (error) {
    console.error("Update user payment error:", error);

    return res.status(500).json({
      message: "Update user payment error",
      error: error.message,
    });
  }
};
