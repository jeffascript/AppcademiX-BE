const { Router } = require('express')
const passport = require('passport')
const postModel = require('../model/postSchema')
const router = Router()


router.get('/:hastag', async (req, res) => {
    try {
       let postWithTags = await postModel.find().where('tags').in(req.params.hastag)
       if(!postWithTags)
           return res.status(404).send(`there are no post with the hastag ${req.params.hastag}`)

        res.send(postWithTags)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post('/:postId', async (req, res) => {
    try {
        let tags = req.body.tags.split(',').map(singeleTag => singeleTag.trim())
        
        const newTags = await postModel.findByIdAndUpdate(req.params.postId, {
            $addToSet: {
                tags: {$each: tags}
            }
        }, {
            new: true
        })

        res.send(newTags)
    } catch (error) {
        res.status(500).send(error.message)
    }
})


module.exports = router