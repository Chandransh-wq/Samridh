import express from "express";
import UserSchema from "../Schema/UserSchema.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => {
  return `Bearer ${jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "5h",
  })}`;
};

router.post("/register", async (req, res) => {
  const { email, username, password, avatarURL } = req.body;

  try {
    const existingUser = await UserSchema.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Your schema's pre-save hook will handle the hashing here
    const user = new UserSchema({
      email,
      username,
      password,
      avatarURL,
    });

    await user.save();
    const token = generateToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserSchema.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    let isMatch = false;

    // Check if the stored password looks like a bcrypt hash (starts with $2)
    const isHashed =
      typeof user.password === "string" && user.password.startsWith("$2");

    if (isHashed) {
      try {
        isMatch = await user.comparePassword(password);
      } catch (err) {
        isMatch = false; // Bcrypt failed or hash was malformed
      }
    } else {
      // Fallback: It's an old plaintext account
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Success: Generate token and response
    const token = generateToken(user._id);
    const response = user.toObject();
    delete response.password;

    return res.status(200).json({
      message: "Logged IN",
      user: response,
      token: token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
