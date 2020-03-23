const { Router } = require('express')
const passport = require('passport')
const CryptoJS = require("crypto-js");
const { generateToken } = require('../middlewares/authentificationMiddleware')
const { verifyEmail } = require('../middlewares/verifyEmail')
const { sendEmail } = require('../middlewares/sendEmail')
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
        const username = await CryptoJS.AES.encrypt(user.username, process.env.CRYPTO_SECRET).toString();
        let subject = "APPCADEMIX Account Verification Token"
        let to = user.email
        let from = process.env.FROM_EMAIL
        let link = `${req.protocol}://${req.get('host')}/api/auth/verify/${username}`
        console.log(link)
        let html = `<p>Hi ${user.username}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`

        await sendEmail({ to, from, subject, html });
        res.status(200).json({ message: 'You have been successfully registered check your email activate your account' })

    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/login", verifyEmail(), passport.authenticate('local'), async (req, res) => {
    try {
        const token = generateToken({ _id: req.user._id, username: req.user.username })
        res.send({ access_token: token, username: req.user.username })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/refreshtoken", passport.authenticate('jwt'), async (req, res) => {
    try {
        const token = generateToken({ _id: req.user._id, username: req.user.username })
        res.send({ access_token: token, username: req.user.username })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/verify/:username', async (req, res) => {
    try {
        const bytes = CryptoJS.AES.decrypt( req.params.username, process.env.CRYPTO_SECRET);
        const username = bytes.toString(CryptoJS.enc.Utf8);
        const userProfile = await UserModel.findOneAndUpdate({ username:username }, {
            $set: {
                isVerified: true
            }
        }, { new: true });

        res.redirect('/login')
    } catch (error) {
        res.status(500).send(error.message)
    }
});

module.exports = router