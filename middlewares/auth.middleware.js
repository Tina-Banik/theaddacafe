const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();
const userModel = require("../models/user.model");
/**verify the access token */
const verifyAccessToken = (async(req,res,next)=>{
    try {
        const access_key = process.env.ACCESS_KEY ;
        console.log("The access key is : ", access_key);
        if(access_key){
            const accessToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
            ? req.headers.authorization.split(" ")[1] : req.headers['_accesstoken'] || req.cookies.accessToken;
            // const accessToken = req.headers.authorization.split(" ")[1];
            console.log("The access request headers : ", req.headers);
            console.log("The request headers access token :", accessToken);
            // const isBlacklisted = await checkBlacklists(accessToken);
            // if (isBlacklisted) return res.status(403).send("Token is blacklisted, login again.");
            const decoded = jwt.verify(accessToken, access_key);
            console.log("The access payload decoded :", decoded);
            req.decode = decoded;
            console.log("The access req.decode ", req.decode);
            next();
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({message: "The access token is expired"})
    }
})
/**verify the refresh token  */
const veriFyRefreshToken = (async(req,res,next)=>{
    try {
        const refresh_key = process.env.REFRESH_KEY || crypto.randomBytes(64).toString("Hex");
        console.log("the refresh key : ", refresh_key);
        if(refresh_key){
            const refreshToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
            ? req.headers.authorization.split(" ")[1] : req.headers['_refreshtoken'] || req.cookies.refreshtoken;
            // const refreshToken =  req.headers.authorization.split(" ")[1];
            console.log("The request headers : " , req.headers);
            console.log("The request headers refresh token : " , req.headers['_refreshtoken']);
            const decoded = jwt.verify(refreshToken, refresh_key);
            console.log("The refresh payload decoded : ", decoded);
            // const user = await userModel.findById(decoded._id); // for logout I use this line
            req.decode = decoded;
            // req.user = user;
            console.log("The refresh req.decode : ", req.decode);
            // console.log("The req.user : ", req.user);
            next();
        }
    } catch (error) {
        console.error(error);
        return res.status(401).send(error.message)
    }
    
})

module.exports = {verifyAccessToken, veriFyRefreshToken};
console.log("the verify access token and refresh token is ready to use...")