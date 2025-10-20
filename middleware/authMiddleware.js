import User from "../models/User.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const token = authorization.split(" ")[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await User.findById(payload.userId).select("_id name email");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    next(new Error("Not authorized, token failed to verify"));
  }
};
