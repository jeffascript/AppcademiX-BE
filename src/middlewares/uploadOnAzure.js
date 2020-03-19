const multer = require('multer')
const MulterAzureStorage = require("multer-azure-storage")
const dotenv = require('dotenv')
dotenv.config()

 const upload = multer({
    storage: new MulterAzureStorage({
      azureStorageConnectionString: process.env.AZURE_STRINGS,
      containerName: 'images',
      containerSecurity: 'blob',
    })
  })

  module.exports = {
      uploadAzzure:upload
  }