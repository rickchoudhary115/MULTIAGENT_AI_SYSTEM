import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import connectDB from "./config/db.js";
import  router  from "./routes/agent.route.js";




const port = process.env.PORT || 8003;

const app = express();

app.use(express.json());
app.use("/",router);
app.get("/", (req, res) => {
  res.json({ message: "Hello from agent" });
});

app.listen(port, async () => {
  console.log(`agent is running on port ${port}`);
  await connectDB();
});
