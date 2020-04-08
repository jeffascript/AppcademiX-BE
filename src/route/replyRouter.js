const express = require("express");
const CommentModel = require("../model/commentSchema");
const passport = require("passport");
const router = express.Router();


router.post(
  "/:commentId",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
          let newReply = {
            ...req.body,
            userInfo:req.user._id
          }

          const comments = await CommentModel.findOne({_id: req.params.commentId })
          if (!comments)
            return res.status(500).send(`comment id ${req.params.commentId} not found`)
      
          let newCreatedReply = await CommentModel.findByIdAndUpdate(req.params.commentId, {
            $push: {
                replies: newReply
            }
        }, {
            new: true
        }).populate({ path: "replies.userInfo", model : "users"})

          res.send(newCreatedReply.replies)
      
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.get("/:commentId/:replyId", async (req, res) => {
  try {
      const singleReply = await CommentModel.findOne({
          _id: req.params.commentId,
          "replies._id": req.params.replyId
      }, {
          "replies.$": 1
      }).populate({ path: "replies.userInfo", model : "users"})

      res.status(200).send(singleReply)
  } catch (error) {
      res.status(500).send(error)
  }
})

router.patch("/:commentId/:replyId",passport.authenticate("jwt"),async (req, res, next) => {
  try {
      const reply= await CommentModel.findOneAndUpdate({
          _id: req.params.commentId,
          "replies._id": req.params.replyId
      }, {"replies.$": req.body}, {new: true})
      res.send("succefully edited!!!!")
  } catch (error) {
      res.status(500).send(error)
  }
})


router.delete('/:commentId/:replyId', passport.authenticate("jwt") ,async (req, res) => {
  try {
      const reply = await CommentModel.findByIdAndUpdate(req.params.commentId, {
          $pull: {
              replies: {
                  _id: req.params.replyId
              }
          }
      });
      res.send('Removed ')
  } catch (error) {
      res.status(500).send(error)
  }
})

module.exports = router;
