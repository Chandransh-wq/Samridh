// routes/user.js (Create this new file for protected operations)
import express from "express";
import protectRoute from "../middleWare/authMiddleWare.js";
// Import User model if you need it here

const router = express.Router();

// This route is now protected. An unlogged-in user cannot access it.
router.get("/profile", protectRoute, (req, res) => {
  // If the middleware passes, this code runs
  res.status(200).json({ message: "Welcome to your protected profile route!" });
});

export default router;
