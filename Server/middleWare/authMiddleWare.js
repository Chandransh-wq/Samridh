// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (split "Bearer" from the actual token string)
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // (Optional) You can fetch the user details from the database here if needed,
      // but for basic protection, the decoded ID is enough.
      // Example: req.user = await User.findById(decoded.id).select("-password");

      // 3. Call next() to allow the request to proceed to the protected route handler
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token is provided
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protectRoute;
