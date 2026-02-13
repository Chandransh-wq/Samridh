// routes/auth.js
import express from "express";
import UserSchema from "../Schema/UserSchema.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (id) => {
  // Sign the token with the user ID as the payload, the secret key, and an expiration time
  return `Bearer ${jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  })}`;
};

router.post("/register", async (req, res) => {
  // Collect all required data from the request body, including the new 'password' field
  const info = {
    name: req.body.name, // Note: The schema expects 'username', not 'name'
    email: req.body.email,
    username: req.body.username, // Use the correct field name 'username'
    password: req.body.password, // Include the password
    avatarURL: req.body.avatarURL,
    // createdAt is handled by the schema default
  };

  try {
    const existingUser = await UserSchema.findOne({ email: info.email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // The pre-save hook in your schema will automatically hash the password here
    const user = new UserSchema(info);
    await user.save();
    const token = generateToken(user._id);

    // Optional: Remove the password from the response object for security
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    console.error(error);
    // Mongoose validation errors will be caught here
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserSchema.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    const token = generateToken(user._id);
    const response = user.toObject();
    delete response.password;

    console.log("status 200, logged in, ", response, "    ", token);
    return res
      .status(200)
      .json({ message: "Logged IN", user: response, token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
