import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
dotenv.config({ override: true });

const port = process.env.PORT || 8001;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.json({ message: "Hello from auth" });
});

app.use("/auth", authRouter);

app.listen(port, async () => {
  console.log(`auth is running on port ${port}`);
  await connectDB();
});
