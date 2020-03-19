const multer = require('multer')
const {join, extname} = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(__dirname, '../../public/images'))
    },
    filename: (req, file, cb) => {
        cb(null, `${req.params.username}${extname(file.originalname)}`)
    }
})
const upload = multer({
    storage:storage
})
module.exports = {
    uploadLocal: upload
}