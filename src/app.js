import dotenv from "dotenv";
import app from "./server.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server first
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Then connect DB
connectDB()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });