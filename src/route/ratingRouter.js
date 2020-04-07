const express = require("express");
const passport = require("passport");
const Posts = require("../model/postSchema");
const Users = require("../model/userSchema")
const ratingsRouter = express.Router();

ratingsRouter.get("/:postId", async (req, res) => {
  try {
    const {
      postId
    } = req.params;
    const upVotes = await Posts.findById(postId);
 
      const allPostsWithRatings = await Posts.findById(postId, {
        ratings: 1,
        _id: 0
      });
      const upVotesForPostId = allPostsWithRatings.ratings;
      //   console.log(upVotesForPostId.length);

      res.send({
        upVotalTotal: upVotesForPostId.length,
        post: upVotes
      });
    
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

ratingsRouter.post(
  "/:postID/:username",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send({
            message: "You are not authorized for this reaction"
          });
      } else {

        const {
          postID
        } = req.params;
        const checkForID = await Posts.findById(postID);

        if (!checkForID) {
          res.status(404).send({
            message: "No post for reaction"
          });
        } else {

          const {
            postID
          } = req.params;
          const checkForID = await Posts.findById(postID);
          if (!checkForID) {
            res.status(404).send({
              message: "No post for reaction"
            });
          } else {
            const userExists = await Posts.find({
              "ratings.upvotedBy": req.params.username
            }, {
              _id: 0,
              "ratings.$": 1
            });

            if (userExists) {
              //   console.log(userExists)
              const removeExistingUser = {
                upvotedBy: req.params.username
              };
              await Posts.findByIdAndUpdate(postID, {
                $pull: {
                  ratings: removeExistingUser
                }
              });
            }
            //Increase rating of user
            await Users.findOneAndUpdate({
              username: checkForID.username
            }, {
              $inc: {
                rating: +1
              }
            })
           
            const addTheUser = {
              upvotedBy: req.params.username
            };
            await Posts.findByIdAndUpdate(postID, {
              $push: {
                ratings: addTheUser
              }
            });


            const allRatings = await Posts.findById(postID, {
              ratings: 1,
              _id: 0
            });

            const totalRatings = allRatings.ratings;

            await Posts.findByIdAndUpdate(postID, {
              $set: {
                ratingsCount: totalRatings.length
              }
            });

            res.send({
              message: "added the upvote by " + req.params.username
            });


          }
        }


      }
    } catch (ex) {
      console.log(ex);
      res.status(500).send(ex);
    }
  }
);



ratingsRouter.delete("/:postID/:username", passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send({
            message: "You are not authorized for this reaction"
          });
      } else {
        const {
          postID
        } = req.params;
        const checkForID = await Posts.findById(postID);

        if (!checkForID) {
          res.status(404).send({
            error: "No post for reaction"
          });
        } else {
          const userToBeDeleted = await Posts.find({
            "ratings.upvotedBy": req.params.username
          }, {
            _id: 0,
            "ratings.$": 1
          });
          if (!userToBeDeleted) {

            res.status(404).send({
              error: "User never rated the Post"
            });
          } else {
            let body = {
              upvotedBy: req.params.username
            };
            await Posts.findByIdAndUpdate(postID, {
              $pull: {
                ratings: body
              }
            });

            const allRatings = await Posts.findById(postID, {
              ratings: 1,
              _id: 0
            });

            const totalRatings = allRatings.ratings;


            //Decrease rating of user
            await Users.findOneAndUpdate({
              username: checkForID.username
            }, {
              $inc: {
                rating: -1
              }
            })
            

            await Posts.findByIdAndUpdate(postID, {
              $set: {
                ratingsCount: totalRatings.length
              }
            });

            res.send({
              success: "deleted the like by user"
            });
          }
        }
      }
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }
)

module.exports = ratingsRouter;