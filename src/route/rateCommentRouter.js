const express = require("express");
const CommentModel = require("../model/commentSchema");
const passport = require("passport");
const router = express.Router();


router.post(
    "/:commentId",
    passport.authenticate("jwt"),
    async (req, res) => {
      try {
  
            const comments = await CommentModel.findOne({_id: req.params.commentId })
            if (!comments)
              return res.status(500).send(`comment id ${req.params.commentId} not found`)

            if (!comments.upvoters.includes(req.user._id)) {
                
                const commentToRate = await CommentModel.findByIdAndUpdate(req.params.commentId, {
                    $push:{ upvoters:req.user._id },
                    upvoted:true,
                    $inc:{upvotes:1}
                }, {
                    new: true,
                    upsert:true
                })
                let upvotesInfo = {
                  upvotes:  commentToRate.upvotes,
                  upvoted:  commentToRate.upvoted,
                  upvoters:  commentToRate.upvoters

                }
               return res.send(upvotesInfo)
            }
        
            const commentToRate = await CommentModel.findByIdAndUpdate(req.params.commentId, {
                $pull:{ upvoters:req.user._id },
                upvoted: false ,
                $inc:{upvotes:-1}
            }, {
                new: true,
                upsert:true
            })

            let upvotesInfo = {
                upvotes:  commentToRate.upvotes,
                upvoted:  commentToRate.upvoted,
                upvoters:  commentToRate.upvoters
            }

            res.send(upvotesInfo)
        
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  );



module.exports = router;