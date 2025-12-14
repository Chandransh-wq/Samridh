import jwt from "jsonwebtoken";
import UserSchema from "../Schema/UserSchema.js";
// Import your Mongoose User model (adjust the path as necessary)

const protectRoute = async (req, res, next) => {
  let token;

  // 1. Check for token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGciOi...")
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Fetch the full user details from the database based on the ID in the token
      //    We select everything EXCEPT the password field.
      //    The user object is then attached to the 'req' object (e.g., req.user)
      req.user = await UserSchema.findById(decoded.id).select("-password");

      // Check if the user actually exists in the database
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      // 4. Call next() to allow the request to proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error);
      // Handle expired token or invalid token errors
      res
        .status(401)
        .json({ message: "Not authorized, token failed or expired" });
    }
  }

  // If no token was provided in the header
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

export default protectRoute;
