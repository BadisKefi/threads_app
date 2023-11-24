import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    etat: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  });
  
  const Request = mongoose.models.Request || mongoose.model("Request", requestSchema);
  export default Request;
  