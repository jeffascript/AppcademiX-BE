const {
    Router
} = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
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
const {passTemplate} = require('../utils/changePassTemplate')
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
        const checkUsername = await UserModel.findOne({username:req.body.username}) 
        if (checkUsername && checkUsername.username) 
            return res.status(500).json({ type: 'USERNAME_EXIST', message: 'There is already a account with this username' });

            const checkEmail = await UserModel.findOne({email:req.body.email}) 
            if (checkEmail && checkEmail.email) 
                return res.status(500).json({ type: 'EMAIL_EXIST', message: 'There is already account with this email address' });

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
            message: 'You have been successfully registered check your email to activate your account'
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

        res.redirect(`${process.env.CLIENT_BASE_URL}/`)
    } catch (error) {
        res.status(500).send(error.message)
    }
});

/**
 * change password
 */

router.post('/forgotpwd', async (req, res) => {
    try {
        const userProfile = await UserModel.findOne({email:req.body.email})
        if (!userProfile && !checkUsername.email) 
            return res.status(404).json({ type: 'NOT_FOUND', message: 'user not found' });

        let token = generateToken({_id:userProfile._id})

        let subject = "APPCADEMIX change password"
        let to = req.body.email
        let from = process.env.FROM_EMAIL
        let link = `${process.env.CLIENT_BASE_URL}/password?token=${token}&username=${userProfile.username}`
        let html = passTemplate(userProfile,link)

        await sendEmail({
            to,
            from,
            subject,
            html
        });
        

        res.status(200).json({
            message: 'we send you email with the recovery link'
        })

    } catch (error) {
        res.status(500).send(error.message)
    }
});

router.post('/resetpassword', passport.authenticate("jwt"), async (req, res) => {
  
    try {

        const u = await UserModel.findById(req.user._id)
        await u.setPassword(req.body.password)
        u.save()
        res.send({message:"password updated"})
        
    } catch (error) {
        res.status(500).send(error)
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