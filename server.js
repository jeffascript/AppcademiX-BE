const express = require("express");
const server = express();
require("dotenv").config();
const cors = require("cors");
const listEndPoints = require("express-list-endpoints");

server.use(express.json()); // without this, you cannot post
server.use(cors());

server.get("/", async (req, res) => {
  await res.send("I am here");
});

const PORT = process.env.PORT || 9500;

console.log(listEndPoints(server));

server.listen(PORT, () => {
  console.log(`I am listening to port ${PORT}`);
});
