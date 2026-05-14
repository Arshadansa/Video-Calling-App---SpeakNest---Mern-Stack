import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

//instead of create all in one file, we can create separate route files and import them here. 
// This keeps our code organized and maintainable.
// app.get("/", (req, res) => {
//   res.send("Hello World");
// });

// app.get("/api/auth/signup", (req, res) => {
//   res.send("Signup route");
// });

// app.get("/api/auth/login", (req, res) => {
//   res.send("Login route");
// });

// app.get("/api/auth/logout", (req, res) => {
//   res.send("Logout route");
// });

app.use(express.json()); // Middleware to parse JSON bodies
app.use("/api/auth",authRoutes);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   connectDB();
// });

connectDB()
.then(()=>{
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  })
})
.catch((err)=>{
  console.log('erorr in connecting db',err);
  
})
