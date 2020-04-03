const express = require("express");
const passport = require("passport");
const postsRouter = express.Router();
const Profiles = require("../model/userSchema");
const Posts = require("../model/postSchema");
const multer = require("multer");
const multerConfig = multer({});
const fs = require("fs-extra");
const path = require("path");
const { pageScraper } = require('../utils/webPageScraper')

/**
 * get meta data
 */
postsRouter.get("/scrap", async (req, res) => {
  try {
    let { url } = req.body
    const $ = await pageScraper(url)
    const getMetaTag = (name) =>
      $(`meta[name=${name}]`).attr('content') ||
      $(`meta[property="og:${name}"]`).attr('content') ||
      $(`meta[property="twitter:${name}"]`).attr('content')

    const metaData = {
      title: getMetaTag('title') || '',
      descripton: getMetaTag('description') || '',
      image: getMetaTag('image') || '',
      author: getMetaTag('author') || ''
    }

    res.status(200).send(metaData)

  } catch (error) {
    res.status(500).send(error.message)
  }
})


postsRouter.get("/all", async (req, res) => {
  try {
    const posts = await Posts.find({})
    res.status(200).send(posts)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
})

postsRouter.get("/", async (req, res) => {
  try {
    const postsCount = await Posts.countDocuments();

    const query = req.query;
    const { limit, skip, sort, number } = query;
    delete query.limit;
    delete query.skip;
    delete query.sort;
    delete query.number;
    const postsList = await Posts.find(query)
      .sort({ [sort]: number || -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    postsList.length > 0
      ? res.send({
        total: postsCount,
        queryParam: `${req.protocol}://${req.get(
          "host"
        )}/posts?sort=string&limit=number&skip=number`,
        postsList
      })
      : res.status(404).send("No post to show at the moment!");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

postsRouter.get("/:id", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
  
    if (post) {
      const postToEdit = await Posts.findByIdAndUpdate(req.params.id, {
        $inc: {
          views:1
        }
      },{new:true});
    }

    post || post.length > 0
      ? res.send(post)
      : res.status(404).send("This post was not found!");
  } catch (ex) {
    console.log(ex);
    res.status(500).send(ex);
  }
});

postsRouter.get("/username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const post = await Posts.find({ username: username });

    if (!post) {
      res.status(404).send("cannot find the profile with the username");
    }

    res.send(post);
  } catch (ex) {
    console.log(ex);
    res.status(500).send(ex);
  }
});

postsRouter.post(
  "/:username",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await Profiles.findOne({ username }); // destructured--> ({ username: username})
      if (!profile) {
        res.status(404).send({ message: "Username not found" });
      }

      if (req.user.username !== username) {
        res.status(401).send("You are not authorized to post");
      } else {
        req.body.username = username;
        // req.body.ratingsCount = db.collection.aggregate( { $project: {name:1, telephoneCount: {$size: "$telephone"}}})

        const newPost = await Posts.create(req.body);
        res.send({ success: "Post added", newPost });
      }
    } catch (ex) {
      console.log(ex);
      res.status(500).send(ex);
    }
  }
);

postsRouter.post(
  "/image/:id/:username",
  multerConfig.single("postImage"),
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res.status(401).send("You are not authorized to post");
      } else {
        const fileName = `post_${req.params.id}${path.extname(
          req.file.originalname
        )}`; //the assigned name for the image with extension name
        const newImageLocation = path.join(
          __dirname,
          "../../images/posts",
          fileName
        );
        await fs.writeFile(newImageLocation, req.file.buffer);
        req.body.image = `${req.protocol}://${req.get(
          "host"
        )}/images/posts/${fileName}`;

        const newPostImg = await Posts.findByIdAndUpdate(
          { _id: req.params.id },
          {
            $set: {
              image: req.body.image
            }
          }
        );

        newPostImg.save();
        const updatedPost = await Posts.findById(req.params.id)

        res.send({msg:"image url updated", newPost:updatedPost });
      }
    } catch (ex) {
      console.log(ex);
      res.status(500).send(ex);
    }
  }
);

postsRouter.put(
  "/:username/:id",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send("You do not have the authorization to edit this post");
      } else {
        const postToEdit = await Posts.findByIdAndUpdate(req.params.id, {
          $set: {
            ...req.body
          }
        });

        if (!postToEdit) {
          res.status(404).send(`Post with id: ${req.params.id} is not found !`);
        } else {
          res.send({ Message: "Updated!", post: req.body });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

postsRouter.delete(
  "/:username/:id",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send("You do not have the authorization to delete this post");
      } else {
        const deletedPost = await Posts.findByIdAndDelete(req.params.id);

        if (!deletedPost) {
          res.status(404).send({
            Message: `Post with id: ${req.params.id} not found for deletion!`
          });
        } else {
          res.send({ Message: "Successfully Deleted" });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);





module.exports = postsRouter;
