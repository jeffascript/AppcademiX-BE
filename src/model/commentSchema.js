const mongoose = require("mongoose")

const replySchema = new mongoose.Schema({
    reply: {
        type: String,
        required: true
    },
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }
}, {
        timestamps: true
    
})

const commentSchema = new mongoose.Schema({
    postid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        required: true
    },
    parentid:[mongoose.Schema.Types.ObjectId],
    replies:[replySchema],
    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    upvotes:{
        type: Number,
        default:0,
        min:0
    },
    upvoters:[mongoose.Schema.Types.ObjectId],
    upvoted:{
        type: Boolean,
        default: false
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("comments",commentSchema)

