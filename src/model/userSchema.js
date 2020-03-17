const mongoose = require("mongoose")
const passport = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Antu_system-switch-user.svg/600px-Antu_system-switch-user.svg.png"
    },
    refreshtoken: String
}, {
    timestamps: true
})

userSchema.plugin(passport)

module.exports = mongoose.model("users",userSchema)