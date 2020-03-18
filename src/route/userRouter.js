const { Router } = require('express')
const passport = require('passport')
const UserModel = require('../model/userSchema')
const {upload} = require('../middlewares/uploadImageMiddleware')
const router = Router()

router.get("/",  async (req, res) => {
    try {
        const requestedUser = await UserModel.find({})
        if (!requestedUser )
            throw new Error(`user not found`)
        res.send(requestedUser)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.put('/:username',passport.authenticate('jwt'), async (req, res) => {
	try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized to edit ***** ${req.params.username} ***** profile`)
        delete req.body._id;
        const userProfile = await UserModel.findOneAndUpdate({ username: req.user.username }, {
            $set: {
                ...req.body
            }
        }, { new: true });
        
        res.send(userProfile)
    } catch (error) {
        res.status(500).send(error.message)
    }
});

router.delete('/:username',passport.authenticate('jwt'), async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized to edit ***** ${req.params.username} ***** profile`)
        const userProfileToDelete = await user.findOneAndDelete({ username: req.user.username }, { new: true });
        res.send('deleted')
    } catch (error) {
        res.status(500).send(error.message)
    }
});

router.post('/:username/image',async (req, res) => {
    //TODOO
});

module.exports = router