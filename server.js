import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ideaRouter from "./routes/ideaRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server requests like Postman
      if (!origin) return callback(null, true);

      // allow localhost
      if (origin === "http://localhost:3000") return callback(null, true);

      // allow any Vercel deployment
      if (origin.startsWith("https://") && origin.endsWith(".vercel.app"))
        return callback(null, true);

      // block all other origins
      callback(new Error("CORS not allowed from this origin"));
    },
    credentials: true, // required for cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/ideas", ideaRouter);

app.use("/api/auth", authRouter);

// 404 Fallback
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
