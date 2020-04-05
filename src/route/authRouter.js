const {
    Router
} = require('express')
const passport = require('passport')
const {
    generateToken
} = require('../middlewares/authentificationMiddleware')
const {
    verifyEmail
} = require('../middlewares/verifyEmail')
const {
    sendEmail
} = require('../middlewares/sendEmail')
const {emailTemplate} = require('../utils/registerEmailTemplate')
const UserModel = require('../model/userSchema')
const router = Router()

router.get("/", async (req, res) => {
    try {
        res.send(await UserModel.find({}))
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/register", async (req, res) => {
    try {
        const user = await UserModel.register(req.body, req.body.password)
        const username = user.username
        let subject = "APPCADEMIX Account Verification Token"
        let to = user.email
        let from = process.env.FROM_EMAIL
        let link = `${req.protocol}://${req.headers.host}/api/auth/verify?token=${username}`
        let html = emailTemplate(user,link)

        await sendEmail({
            to,
            from,
            subject,
            html
        });
        res.status(200).json({
            message: 'You have been successfully registered check your email activate your account'
        })

    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/login", verifyEmail(), passport.authenticate('local'), async (req, res) => {
    try {
        const token = generateToken({
            _id: req.user._id,
            username: req.user.username
        })
        let {_id,username, email,firstname,lastname,image} = req.user
        let curentUser = {
            _id,
            username,
            email,
            firstname,
            lastname,
            image
        }
        res.send({
            access_token: token,
            userInfo: curentUser 
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/refreshtoken", passport.authenticate('jwt'), async (req, res) => {
    try {
        const token = generateToken({
            _id: req.user._id,
            username: req.user.username
        })
        res.send({
            access_token: token,
            username: req.user.username,
            userInfo:req.user
        })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/verify', async (req, res) => {
    try {
        const userProfile = await UserModel.findOneAndUpdate({
            username: req.query.token
        }, {
            $set: {
                isVerified: true
            }
        }, {
            new: true
        });

        res.redirect('http://localhost:3000/')
    } catch (error) {
        res.status(500).send(error.message)
    }
});

/**
 * FACEBOOK LOGIN
 */

router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
    passport.authenticate('facebook', { scope: ['email'], failureRedirect: `${process.env.CLIENT_BASE_URL}/login` }),
    async (req, res) => {
        try {
            res.redirect(`${process.env.CLIENT_BASE_URL}/?token=${generateToken({ _id: req.user._id, username: req.user.username})}&username=${req.user.username}`);
        } catch (error) {
            res.send(error)
        }
    });

/**
 * google
 */

router.get('/google',
    passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/google/callback',
    passport.authenticate('google', { scope: ['profile','email'], failureRedirect: `${process.env.CLIENT_BASE_URL}/login` }),
    async (req, res) => { 
        try {
            res.redirect(`${process.env.CLIENT_BASE_URL}/?token=${generateToken({ _id: req.user._id, username: req.user.username})}&username=${req.user.username}`);
        } catch (error) {
            res.send(error)
        }
    });



module.exports = router