const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
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



passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos', 'email','name']
  },
  async (accessToken, refreshToken, profile, done) =>{
    try{
        const userFromFacebook = await UserModel.findOne({email:profile.emails[0].value, facebookId: profile.id})
        if (userFromFacebook) 
            return done(null, userFromFacebook)
        else 
        {
            const createUserProfile = await UserModel.create({
                username:`${profile.name.givenName}.${profile.name.familyName}`,
                facebookId:profile.id,
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                image: profile.photos[0].value ,
                email:profile.emails[0].value,
                isVerified:true,
                refreshtoken: refreshToken
            })
            return done(null, createUserProfile ) 
        }
    }
    catch(error){
        return done(error) 
    }
}))

/**
 * google strategy
 */

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.G_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) =>{
    try{
        const userFromGoogle = await UserModel.findOne({email:profile.emails[0].value})
        if (userFromGoogle) 
            return done(null, userFromGoogle)
        else 
        {
            const createUserProfile = await UserModel.create({
                username:`${profile.name.givenName}${profile.name.familyName || profile.id}`,
                googleId:profile.id,
                firstname: profile.name.givenName || profile.name.familyName,
                lastname: profile.name.familyName || profile.name.givenName,
                image: profile.photos[0].value ,
                email:profile.emails[0].value,
                isVerified:true,
                refreshtoken: refreshToken
            })
            return done(null, createUserProfile ) 
        }
    }
    catch(error){
        return done(error) 
    }
}))



module.exports = {
    generateToken: user => jwt.sign(user,password,{expiresIn:4000})
}