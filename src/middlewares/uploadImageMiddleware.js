const multer = require('multer')
const {join, extname} = require('path')

const storage = multer.diskStorage({})

module.exports = {
    upload: storage
}