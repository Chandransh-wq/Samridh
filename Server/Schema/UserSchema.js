import mongoose, { Mongoose, now } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  username: {
    type: String,
    required: true,
  },
  avatarURL: {
    type: String,
    default: null, // optional image URL
  },
});

// hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return; // Simply return if no modification is made
  }
  this.password = await bcrypt.hash(this.password, 10);
  // Function ends implicitly, Mongoose handles flow
});

// verify password
userSchema.methods.comparePassword = function (pass) {
  return bcrypt.compare(pass, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
