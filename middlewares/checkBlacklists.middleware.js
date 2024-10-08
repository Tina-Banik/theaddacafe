const Blacklist = require("../models/blacklists.model");
const jwt = require("jsonwebtoken");
const checkBlacklists = async(req,res,next)=>{
    console.log("Executing checkBlacklists middleware...");
    console.log("Request Headers: ", req.headers);
    console.log("Request Cookies: ", req.cookies);
    // const authHeader = req.headers.authorization || '';
    // let token =  authHeader.startsWith('Bearer ') ? authHeader.split(" ")[1]:null;
    // const token = extractToken(req);
    // const token = authHeader && authHeader.split(" ")[1];
    // let token =  req.headers._refreshtoken || req.cookies.refreshToken;
    // Check the _refreshtoken header if token is not found in the Authorization header
    // if (!token && req.headers._refreshtoken) {
    //     token = req.headers._refreshtoken;
    // }
    // // // Fall back to the refreshToken from cookies if token is not found in headers
    //  if (!token && req.cookies && req.cookies.refreshToken) {
    //    token = req.cookies.refreshToken;
    // }
    // if(!token){
    //      console.log("No token found in request headers.");
    //     return res.status(401).json({ message: 'Token missing. Unauthorized request.' });
    // }
    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
    ? req.headers.authorization.split(" ")[1]
    : req.headers['_refreshtoken']   
 || req.cookies.refreshToken;
    console.log("Token extracted for blacklist check: ", token);
    if(token){
        try {
            /**after logout the refresh token is blacklisted here and it is shown in the database */
            const blackListed = await Blacklist.findOne({token: token});
            console.log("the black listed found in DB : ", blackListed);
            if(blackListed){
                console.log("Token is blacklisted, stopping request.");
                return res.status(401).json({message: 'Token is already destroyed !! You have to login to visit all the paths..'})
            }
            next();
        } catch (error) {
            console.error("Error checking token in blacklists : ", error);
            return res.status(500).json({message:"Internal server error while checking the token"})
        }
    }else{
        next();
    }
}
module.exports = {checkBlacklists};
console.log("The check black lists is ready to use..")