const mongoose = require("mongoose")

const upvote = {
    upvotedBy: {
        type: String
    
       
    }
}

const postSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "http://saveabandonedbabies.org/wp-content/uploads/2015/08/default.png"
    },
    comments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments"
    },
    commentsCount:{
        type: Number,
        default:0,
        min:0
        
    },

    ratings: [upvote],
    
    ratingsCount:{
        type: Number,
        default:0
    },
    tags:[String]
}, {
    timestamps: true
})

module.exports = mongoose.model("posts", postSchema)