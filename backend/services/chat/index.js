import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/chat.route.js";


dotenv.config({ override: true });

const port = process.env.PORT || 8002;

const app = express();

app.use(express.json());

app.use("/",router)
app.get("/", (req, res) => {
  res.json({ message: "Hello from chat" });
});


app.listen(port, async () => {
  console.log( `chat is running on port ${port}`);
  await connectDB();
});
