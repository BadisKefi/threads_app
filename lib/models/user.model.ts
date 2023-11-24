import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: String,
  bio: String,
  onboarded: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  etat: {
    type: String,
    enum: ["banned", "unbanned"],
    default: "unbanned",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;