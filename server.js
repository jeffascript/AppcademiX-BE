const express = require("express");
const server = express();
const cors = require("cors");
const passport = require("passport");
const logger = require("./src/utils/winston");
const morgan = require("morgan");
const { join } = require("path");
const listEndPoints = require("express-list-endpoints");
const connectMongoose = require("./src/db/mongodb");
const authRouter = require("./src/route/authRouter");
const userRouter = require("./src/route/userRouter");
const postRouter = require("./src/route/postRouter");
const ratingRouter = require("./src/route/ratingRouter");
const commentRouter = require("./src/route/commentRouter");
const tagsRouter = require("./src/route/tagsRouter");
const replyRouter = require("./src/route/replyRouter");
const rateCommentRouter = require("./src/route/rateCommentRouter");
const path = require("path");
const grabity = require("grabity");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();

/* server.use(morgan('combined',{stream:logger.stream})) */
server.use(express.json()); // without this, you cannot post
server.use(passport.initialize());
server.use(cors());

const PORT = process.env.PORT || 9500;

server.use("/api/auth", authRouter);
server.use("/api/users", userRouter);
server.use("/api/posts", postRouter);
server.use("/api/ratings", ratingRouter);
server.use("/api/comments", commentRouter);
server.use("/api/posts/hastag", tagsRouter);
server.use("/api/reply", replyRouter);
server.use("/api/rate/comment", rateCommentRouter);
server.use("/images", express.static(join(__dirname, "./public/images/")));

const r = async (url) => {
  try {
    let it = await grabity.grabIt(url);
    return it;
  } catch (error) {
    return error;
  }
};

const metaTagHandler = async (req, res, next) => {
  console.log(await r(req.query.url));
  try {
    const outboundPayload = {
      time: new Date().toISOString(),
      value: await r(req.query.url),
    };
    if (outboundPayload.value.message) {
      res.status(404).send({ error: outboundPayload.value.message });
    } else {
      res.json(outboundPayload).end();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

server.get("/api/metatag", metaTagHandler);

server.get("/", (req, res) => {
  return res.send("I am alive");
});

server.use(
  "/images/posts/",
  express.static(path.join(__dirname, "./images/posts/"))
);

console.log(listEndPoints(server));

server.listen(PORT, () => {
  console.log(`I am listening to port ${PORT}`);
  connectMongoose();
});
