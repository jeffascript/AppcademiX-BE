const { Router } = require('express')
const passport = require('passport')
const postModel = require('../model/postSchema')
const router = Router()


router.get('/:hastag', async (req, res) => {
    try {
        postWithHastag = postModel.find({tags: req.param.hastag})

        res.json({post:postWithHastag})
    } catch (error) {
        res.status(500).send(error.message)
    }
})


module.exports = router