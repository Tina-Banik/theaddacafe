const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

/**logout starts from here */
const verifyJWT = async(req,res,next)=>{
    console.log("req.header('Authorization') : ", req.header("Authorization"));

    try {
        const token = req.cookies.refreshToken || req.header("Authorization").replace("Bearer "," ") || req.headers._refreshtoken;
        console.log("The token with Bearer : ", token);
        if(!token){
            return res.status(401).json({ message: "Unauthorized request. No token provided." });
        }
        const accessToken = req.header("Authorization")?.replace("Bearer ", "") || req.headers._accesstoken;
        try {
             jwt.verify(accessToken, process.env.ACCESS_KEY);
             console.log("The token is an access token. This token can not be used in the logout")
            return res.status(400).json({message:"Use refresh token for the logout.."})
        } catch (error) {
            console.log("Not an access token, checking for the refresh token..")
        }
        const decodedToken = jwt.verify(token, process.env.REFRESH_KEY);
        console.log("The decoded token :", decodedToken);
        const user = await userModel.findById(decodedToken._id);
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ message: "Invalid refresh token or user not found." });
        }
        // if(!user){
        //     return res.status(401).json({ message: "Invalid User..." });
        // }
        req.user = user; // Attach user to the request object
        next();
    } catch (error) {
        console.error("Error in verifying JWT: ", error.message);
        return res.status(401).json({ message: "Invalid Refresh token." });
    }
}

module.exports = {verifyJWT};
console.log("The logout middleware is ready to use...");