import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);

app.use((err, req, res, next) => {
  console.error("❌ Error caught by middleware:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});


connectDB()
.then(()=>{
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  })
})
.catch((err)=>{
  console.log('erorr in connecting db',err);
  
})
