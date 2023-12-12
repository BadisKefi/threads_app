import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    image: String,
    text: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: {
        type: String
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        },
    ],
    likers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    ],

});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;