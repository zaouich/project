const User = require("../models/userModel")
const catchAsync = require("../utils/CatchAsync")
const multer = require("multer")
const sharp = require("sharp")
const jwt = require("jsonwebtoken")
const crypto = require('crypto')
const AppError = require("../utils/AppError")
// give a passport 
const passport = catchAsync(async(user,res)=>{
     const token = jwt.sign({ id: user._id }, process.env.JWTSECRET, { expiresIn: process.env.JWTSECRETEXPIRES });
     return res.status(201).json({
        status:"success",
        user,
        token
        
    })
})
// upload files 
// 1) save the file in the memory
const multerStorage = multer.memoryStorage()
// 2) check if the ile is an image
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith("image")) return cb(null,true)
    cb(new AppError(400,"you should enter a valid image format"),false)
}
// -3) upload the file 
const upload = multer({fileFilter:multerFilter,storage:multerStorage}).single("image")
// -4) sharp the file then save it
const modifyImage = async(req,res,next)=>{
    if(! req.file || !req.file.buffer) return next()
    const imageName =`${ crypto.randomBytes(10).toString('hex')}.jpeg`
    const file = await sharp(req.file.buffer).resize(500,500).toFormat("jpeg").jpeg({quality:90}).toFile(`public/img/users${imageName}`)
    req.fileName = imageName
    next()
}

// sign up
const signUp = catchAsync(async(req,res,next)=>{
    var {first_name,last_name,email,image,password,confirmPassword,role,resume}= req.body
    image = req.fileName
    const newUser = await User.create({
        first_name,last_name,email,image,password,confirmPassword,role,resume
    })
    passport(newUser,res)
    
    
})
module.exports = {signUp,upload,modifyImage}