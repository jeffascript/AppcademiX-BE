const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const passport = require('passport')
const UserModel = require('../model/userSchema')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

passport.serializeUser(UserModel.serializeUser())
passport.deserializeUser(UserModel.deserializeUser())

passport.use(new LocalStrategy(UserModel.authenticate()))

const password = process.env.JWT_SECRET

const jwtConfig = {jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: password}

passport.use(new JwtStrategy(jwtConfig,(jwtPayload,next) => {
    UserModel.findById(jwtPayload._id, (err, user) => {
        if (err) return next(err, null)
        else if (user) return next(null, user)
        else return next(null, false)
    })
}))







module.exports = {
    generateToken: user => jwt.sign(user,password,{expiresIn:4000})
}