const express = require("express");
const server = express();
const cors = require("cors");
const listEndPoints = require("express-list-endpoints");
const connectMongoose = require("./src/db/mongodb")
const User = require("./src/model/userSchema")
const dotenv = require("dotenv");
dotenv.config();

server.use(express.json()); // without this, you cannot post
server.use(cors());




server.get("/", async(req, res) => {
  res.send(await User.find())
})

server.post("/", async (req, res) => {
  try{ let response = await User.create(req.body)
    res.send(response);
  }catch(e){
    res.send(e)
  }
 
});

const PORT = process.env.PORT || 9500;

console.log(listEndPoints(server));

server.listen(PORT, () => {
  console.log(`I am listening to port ${PORT}`);
  connectMongoose()
});