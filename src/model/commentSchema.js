const mongoose = require("mongoose")



const commentSchema = new mongoose.Schema({
    postid: {
        type: mongoose.Schema.Types.String,
        ref: "posts",
        required: true
    },



    userInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("comments",commentSchema)

