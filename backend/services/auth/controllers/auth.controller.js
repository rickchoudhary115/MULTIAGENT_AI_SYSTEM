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
      user,
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
     console.log("===== UPDATE PAYMENT =====");
     console.log("Cookies:", req.cookies);
     console.log("Session:", req.cookies?.session);
     console.log("Body:", req.body);
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

if (!sessionId) {
  return res.status(400).json({
    message: "Session ID is missing",
  });
}

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
    

    return res.status(200).json({
      success: true,
      message: "User payment updated successfully",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
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

export const deductCredicts = async (req, res) => {
  try {
    const { userId, agent } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!agent) {
      return res.status(400).json({
        success: false,
        message: "Agent is required",
      });
    }

    const COST = {
      chat: 1,
      search: 2,
      coding: 3,
      pdf: 10,
      ppt: 10,
      vision: 3,
      image: 4,
      imageAnalyzer: 3,
    };

    const cost = COST[agent];

    if (!cost) {
      return res.status(400).json({
        success: false,
        message: `Unknown agent: ${agent}`,
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        credits: { $gte: cost },
      },
      {
        $inc: {
          credits: -cost,
        },
      },
      {
        new: true,
      },
    );

    if (!user) {
      const existingUser = await User.findById(userId);

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(402).json({
        success: false,
        message: "Insufficient credits",
        credits: existingUser.credits,
        required: cost,
      });
    }

    const sessionId = req.cookies?.session;

    console.log("Session ID:", sessionId);

    // Update Redis
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

    console.log("Credits deducted:", {
      userId,
      agent,
      cost,
      remainingCredits: user.credits,
    });

    return res.status(200).json({
      success: true,
      message: "Credits deducted successfully",
      agent,
      cost,
      credits: user.credits,
      totalCredits: user.totalCredits,
    });
  } catch (error) {
    console.error("Deduct credits error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deduct credits",
      error: error.message,
    });
  }
};