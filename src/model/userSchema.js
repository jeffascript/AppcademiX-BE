const mongoose = require("mongoose")
const passport = require("passport-local-mongoose")
const findOrCreate = require('mongoose-findorcreate')
const { isEmail } = require("validator")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase:true,
        unique: true,
        validate: {
            validator: string => isEmail(string),
            message: "Provided email is invalid"
        }
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    facebookId:{
        type: String
       
    },
    googleId: {
        type: String
        
    },
    rating: {
        type: Number,
        default: 0
    },
    posts: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Antu_system-switch-user.svg/600px-Antu_system-switch-user.svg.png"
    },
    isVerified :{
        type: Boolean,
        default: false
    },
    refreshtoken: String
}, {
    timestamps: true
})

userSchema.plugin(passport)
userSchema.plugin(findOrCreate)

module.exports = mongoose.model("users",userSchema)