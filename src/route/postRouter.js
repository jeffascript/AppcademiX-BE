const express = require("express");

const postsRouter = express.Router(); 

const Posts = require("../model/postSchema");


postsRouter.get("/", async (req, res) => {
  try {
    const postsCount = await Posts.countDocuments();

    const query = req.query;
    const { limit, skip, sort } = query;
    delete query.limit;
    delete query.skip;
    delete query.sort;
    const postsList = await Posts.find(query)
        .sort({ [sort]: 1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

    postsList.length > 0
      ? res.send({
          total: postsCount,
          queryParam : `${req.protocol}://${req.get("host")}/posts?${sort}=string&${limit}=number&${skip}=number`,
          postsList
          
        })
      : res.send("No profile to show at the moment!");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});




postsRouter.get("/username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await Profiles.findOne({ username: username });

    if (!profile) {
      res.status(404).send("cannot find the profile with the username");
    }

    res.send(profile);
  } catch (ex) {
    console.log(ex);
    res.status(500).send(ex);
  }
});


postsRouter.post("/image/:username", async (req,res)=>{
try {
    
    
} catch (ex) {
    console.log(ex);
    res.status(500).send(ex);
}

})



module.exports = postsRouter;