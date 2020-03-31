const express = require("express");
const CommentModel = require("../model/commentSchema");
const passport = require("passport");
const {ObjectID} = require("mongodb");
const router = express.Router();
const PostSchema = require("../model/postSchema");




router.post(
  "/:postId/:commentId",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
     
        let id = new ObjectID();
          let newComment = {
            _id:id,
            ...req.body,
            userInfo:req.user._id,
            postid: req.params.postId
          }

          const parentComment = await CommentModel.findOne({_id: req.params.commentId })
          if (!parentComment)
            return res.status(500).send(`comment id ${req.params.commentId} not found`)
          console.log( parentComment.parent)
          parentComment.parentid.push(id)
          newComment.parentid = parentComment.parentid

          let newCreateComment = await CommentModel.create(newComment);
          newCreateComment= await newCreateComment.populate('userInfo').execPopulate();

          res.send(newCreateComment)
      
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);




module.exports = router;
