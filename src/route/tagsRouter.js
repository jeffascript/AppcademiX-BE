const { Router } = require('express')
const passport = require('passport')
const postModel = require('../model/postSchema')
const router = Router()

router.get('/all/tags', async (req, res) => {
    try {
        let [allTags, allCategory] = await Promise.all([postModel.distinct('tags'),postModel.distinct('category')] )
        res.json({allTags,allCategory})
    } catch (ex) {
res.status(500).send(ex.message)
    }

});

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
        if (!req.body.tags.trim())
            return req.status(404).send(`you must send tags in string separated by coma`)

        let tags = req.body.tags.split(',').map(singleTag => singleTag.trim())
        
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