const { Router } = require('express')
const passport = require('passport')
const { generateToken } = require('../middlewares/authentificationMiddleware')
const UserModel = require('../model/userSchema')
const router = Router()

router.get("/", passport.authenticate('jwt'), async (req, res) => {
    try {
        res.send(await UserModel.find({}))
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/register", async (req, res) => {
    try {
        const user = await UserModel.register(req.body, req.body.password)
        const token = generateToken({ _id: user._id, username: user.username, email: user.email })
        res.send({ access_token: token, username: user.username })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/login", passport.authenticate('local'), async (req, res) => {
    try {
       
        const token = generateToken({ _id: req.user._id, username: req.user.username })
        res.send({ access_token: token, username: req.user.username })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/refresh", passport.authenticate('jwt'), async (req, res) => {
    try {
        const token = generateToken({ _id: req.user._id, username: user.username })
        res.send({ access_token: token, username: req.user.username })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router