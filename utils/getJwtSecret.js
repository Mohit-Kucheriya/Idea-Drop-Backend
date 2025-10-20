import dontenv from "dotenv";

dontenv.config();

// Convert secret into Unit8array
export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
