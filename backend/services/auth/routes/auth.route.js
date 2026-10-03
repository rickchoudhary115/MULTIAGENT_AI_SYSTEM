import express from "express";
import {
  login,
  logout,
  updateUserPayment,
  deductCredicts,
} from "../controllers/auth.controller.js";


const router = express.Router();
router.post("/login", login);
router.get("/logout", logout);
router.post("/update-plan", updateUserPayment);
router.post("/deduct-credits", deductCredicts);

export default router;