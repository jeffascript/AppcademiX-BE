const express = require("express");
const Comment = require("../model/commentSchema");
const passport = require("passport");
const mongoose = require("mongoose");
const commentRouter = express.Router();
const PostSchema = require("../model/postSchema");
const UserSchema = require("../model/userSchema")
// get -> api/posts/:postid
// get -> api/posts/:postid/:commentid
// post -> api/posts/:postid/:username
// put -> api/posts/:postid/:id//:username
// delete -> api/posts/:postid/:id/:username

commentRouter.get("/", async (req, res) => {
  //request,response
  try {


    const query = req.query;
    const { sort } = query;
    delete query.sort;
    const comments = await Comment.find(query)
      .sort({ [sort]: -1 })
  
    res.send(comments);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

commentRouter.get("/:postID", async (req, res) => {
  //request,response
  try {
    //const id = new mongoose.Types.ObjectId(req.params.postID)
    //console.log(id)
    const comments = await Comment.find({ postid: req.params.postID })
    .populate('userInfo');


    
res.send(comments)
    

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// get -> api/posts/:postid/:commentid

commentRouter.get("/:postID/:commentid", async (req, res) => {
  try {
    //let us search in the collection, to see if we have a comment with req.params.postID and also the req.params.commentid
    const uniqueComment = await Comment.findOne({
      postid: req.params.postID,
      _id: req.params.commentid
    });

    uniqueComment
      ? res.send(uniqueComment)
      : res.status(404).send("cannot find this comment");

    // if(uniqueComment){
    //     res.send(uniqueComment)
    // }
    // else{
    //     res.status(404).send("cannot find this comment")
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// post -> api/posts/:postid/:username

commentRouter.post(
  "/:postid/:username",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      //INSRERT comment INTO DB where post = postID AND username = username
      // create() the req.body into our schema
      // let body = username, postId,  text/comment
      const usernameFromReq = req.user.username;
      const postIdFromReq = req.params.postid;
      // console.log(username,postId)
      // console.log(req.body)

      if (usernameFromReq !== req.params.username) {
        res
          .status(401)
          .send("You do not have the authorization to comment on this post");
      } else {
        const postExists = await PostSchema.findById(postIdFromReq);
        if (postExists) {
            /* 
                    let body = {
                     username:usernameFromReq,
                      postid:postIdFromReq,
                      comment:req.body.comment
                      img:req.body.img
                 }
                 */
                
                 
                //  const id = mongoose.Types.ObjectId() 
                //  req.body._id = id
          let newBody = {
            ...req.body,
            userInfo:req.user._id,
            postid: postIdFromReq
          };
          let newComment = await Comment.create(newBody);
          newComment = await newComment.populate('userInfo').execPopulate();

          
          console.log(newComment)
          res.send({
            success: "new comment was made",
            newComment
          });
        } else {
          res.status(404).send("You cannot comment on an unexisting post");
        }

      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);


// put -> api/posts/:postid/:id//:username

commentRouter.put(
    "/:postid/:username/:commentid",
    passport.authenticate("jwt"),
    async (req, res) => {
      try {

        
        if (req.user.username !== req.params.username) {
          res
            .status(401)
            .send("You do not have the authorization to edit this post");
        } else {

            const postInExistence = await PostSchema.findById(req.params.postid)
            if(!postInExistence){
                res.status(404).send("The post for this comment is unavailble")
            }else{

                const commentToEdit = await Comment.findByIdAndUpdate(req.params.commentid, {
                  $set: {
                    ...req.body
                  }
                });
        
                if (!commentToEdit) {
                  res.status(404).send(`Post with id: ${req.params.commentid} is not found !`);
                } else {
                  res.send({ Message: "Updated!", post: req.body });
                }
            }
        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    }
  );


// delete -> api/comments/:commentid/posts/:postid?username=:username

commentRouter.delete(
    "/:commentid/posts/:postid",
    //"/:postid/:id?username=:username",
    passport.authenticate("jwt"),
    async (req, res) => {
        
      try {
        
        if (req.user.username !== req.query.username) {
          res
            .status(401)
            .send("You do not have the authorization to delete this post");
        } else {

            const thePostIdValid = await PostSchema.findById(req.params.postid)
            if(!thePostIdValid){
                res.status(404).send("The post with this comment cannot be found")
            }
            else{

                const deletedComment = await Comment.findByIdAndDelete(req.params.commentid);
        
                if (!deletedComment) {
                  res.status(404).send({
                    Message: `Comment with id: ${req.params.commentsid} not found for deletion!`
                  });
                } else {
                  res.send({ Message: "Successfully Deleted" });
                }
            }

        }
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    }
  );

  


// commentRouter.delete("/:postid/:commentid/:username",passport.authenticate('jwt'), async (req, res) => {
//     try {
        
//         console.log('name')
//         if(req.user.username !== post.username) res.status(404).send('User not found')
//         const comment = await Comment.findOneAndDelete({_id: req.params.commentid});
//         res.send(comment);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });


module.exports = commentRouter;