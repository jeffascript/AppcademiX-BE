const UserModel = require('../model/userSchema')

const verifyEmail = async (req, res, next) => {
  
        const user = await UserModel.findOne({username:req.body.username}) 
        if (!user.isVerified) return res.status(401).json({ type: 'not-verified', message: 'Your account has not been verified.' });
        next()
   
}

module.exports = {
    verifyEmail:(req,res,next) => verifyEmail
}