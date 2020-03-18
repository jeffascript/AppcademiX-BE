const express = require("express");
const server = express();
const cors = require("cors");
const passport = require('passport');
const {join} = require('path')
const listEndPoints = require("express-list-endpoints");
const connectMongoose = require("./src/db/mongodb")
const authRouter = require('./src/route/authRouter')
const userRouter = require('./src/route/userRouter')
const User = require("./src/model/userSchema")
const dotenv = require("dotenv");
dotenv.config();

server.use(express.json()); // without this, you cannot post
server.use(cors());
const PORT = process.env.PORT || 9500;


server.use("/api/auth", authRouter);
server.use("/api/users", userRouter);
server.use("/images", express.static(join(__dirname, './public/images/')))

server.get("/", passport.authenticate("jwt"), async(req, res) => {
  res.send(await User.find())
})

server.post("/:username", passport.authenticate("jwt") ,async (req, res) => {
  try{ let response = await User.create(req.body)
    if(req.params.username === req.user.username)
      res.send(response);
  }catch(e){
    res.send(e)
  }
});



console.log(listEndPoints(server));

server.listen(PORT, () => {
  console.log(`I am listening to port ${PORT}`);
  connectMongoose()
});