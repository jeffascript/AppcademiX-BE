const express = require("express");
const server = express();
const cors = require("cors");
const passport = require('passport');
const {join} = require('path')
const listEndPoints = require("express-list-endpoints");
const connectMongoose = require("./src/db/mongodb");
const authRouter = require("./src/route/authRouter");
const userRouter = require("./src/route/userRouter");
const postRouter = require("./src/route/postRouter");
const ratingRouter = require("./src/route/ratingRouter")
const commentRouter = require("./src/route/commentRouter")
const path = require("path")

const dotenv = require("dotenv");
dotenv.config();

server.use(express.json()); // without this, you cannot post
server.use(passport.initialize())
server.use(cors());

const PORT = process.env.PORT || 9500;

server.use("/api/auth", authRouter);
server.use("/api/users", userRouter);
server.use("/api/posts", postRouter);
server.use("/api/ratings", ratingRouter);
server.use("/api/comments", commentRouter);
server.use("/images", express.static(join(__dirname, './public/images/')))


server.use("/images/posts/", express.static(path.join(__dirname, "./images/posts/")))

console.log(listEndPoints(server));

server.listen(PORT, () => {
  console.log(`I am listening to port ${PORT}`);
  connectMongoose();
});
