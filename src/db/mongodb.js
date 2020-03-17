const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

const connectMongoose = () => {
    mongoose
        .connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        })
        .then(
            () => {
                console.log("Connected to MongoDB!");
            },
            err => {
                console.log(err.reason);
            }
        );
};

module.exports = connectMongoose;