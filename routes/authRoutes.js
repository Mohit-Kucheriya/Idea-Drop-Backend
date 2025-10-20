import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";

const router = express.Router();

// Register route
// @route     POST api/auth/register
// @desc      Register user with email, password, name and send back JWT token
// @access    Public
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({ name, email, password });

    // Generate token
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Set refresh token in HTTP-Only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
});

// Login route
// @route     POST api/auth/login
// @desc      Authenticate user
// @access    Public
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400);
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      res.status(400);
      throw new Error("Invalid credentials");
    }

    // Generate token
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Set refresh token in HTTP-Only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
});

// Logout route
// @route     POST api/auth/logout
// @desc      Logout user and remove refresh token from cookie
// @access    Private
router.post("/logout", async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// Refresh route
// @route     POST api/auth/refresh
// @desc      Generate new access token from refresh token
// @access    Public (Needs valid refresh token in cookie)
router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    console.log(`Refreshing token...`);

    if (!token) {
      res.status(401);
      throw new Error("No refresh token found");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const { userId } = payload;

    // Find user by userId
    const user = await User.findById(userId);
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Generate new access token
    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      "1m"
    );
    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401);
    next(err);
  }
});

export default router;
