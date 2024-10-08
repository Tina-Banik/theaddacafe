const jwt = require("jsonwebtoken");

/**middleware to check if the user is admin */
const isAdmin = async(req,res,next)=>{
    try {
        console.log("The  isAdmin : " , req.decode);
        // const token = req.headers.authorization.split(" ")[1]; //get token form header
        // console.log("The admin get token form header : ", token);
        // const decodedToken = jwt.verify(token,process.env.ACCESS_KEY);
        // console.log("The decoded token for the role based admin : ", decodedToken);
        // req.decode = decodedToken;
        console.log("The admin req.decode : ", req.decode);
        if(req.decode.role !== 'admin'){ //not equal admin
            
            return res.status(403).json({message: "Access Denied. Admins Only"})
        }
        next();
    } catch (error) {
        return res.status(400).json({
            status: false,
            success: 'Something went wrong !!!'
        })
    }
}

/**middleware to check if the user is regular user */
const isUser = async(req,res,next)=>{
    try {
        console.log("The isUser : ", req.decode);
        // const token = req.headers.authorization.split(" ")[1];
        // const decodedToken = jwt.verify(token, process.env.ACCESS_KEY);
        if(req.decode.role !== 'user'){//not equal user
            return res.status(403).json({message: "Access denied. Users Only.."})
        }
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:"Something went wrong.."
        })
    }
}
module.exports = { isAdmin, isUser};
console.log("The role based authentication is ready to use..")

// isAdmin password : r1234, email: roma@gmail.com