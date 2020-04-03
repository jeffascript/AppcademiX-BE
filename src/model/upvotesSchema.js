const mongoose = require("mongoose")



const upvotesSchema = new mongoose.Schema({
    commentid: {
        type: mongoose.Schema.Types.ObjectId
    },

    userid: {
        type: mongoose.Schema.Types.ObjectId
    },
    liked: {
        type: String,
        default: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("commentsUpvotes",upvotesSchema)

