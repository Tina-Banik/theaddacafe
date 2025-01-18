const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");
const {
  createAccess_token,
  createRefresh_token,
} = require("../middlewares/jwt_helper");
const Blacklist = require("../models/blacklists.model");
const jwt = require("jsonwebtoken");
/**register */
const register = async (req, res) => {
  // res.status(200).json("The user is registered successfully...");
  console.log("The request body : ", req.body);
  /**user register code starts */
  const { username, email, password, role } = req.body;
  if (
    !req.body ||
    !req.body.username ||
    !req.body.email ||
    !req.body.password ||
    !req.body.role
  ) {
    console.log(
      "Missing fields : ",
      !username ? "username" : !email ? "email" : !password ? "password" : ""
    );
    const missingFields = !username
      ? "username"
      : !email
      ? "email"
      : !password
      ? "password"
      : !role
      ? "role"
      :""
      ;
    console.log("the missing fields : ", missingFields);
    return res.status(500).json({
      success: false,
      message: `The missing fields ${missingFields}`,
    });
  }
  try {
    const userExists = await userModel.findOne({ email });
    console.log("the user who is already exists : ", userExists);
    if (userExists) {
      return res.status(401).json({
        success: true,
        message: "This user is already registered with us",
      });
    }
    /**hash the passwords */
    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);
    const newUser = await userModel.create({
      username,
      email,
      password: hashPass,
      role
    });
    if (newUser) {
      return res.status(200).json({
        _id: newUser.id,
        email: newUser.email,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "The user data is not valid",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error...",
    });
  }
};
/**user login */
const login = async (req, res) => {
  // res.send("The user login successfully..");
  try {
    const { username, email, password, role } = req.body;
    console.log(`Username: ${username}, Email: ${email}, Password:${password}`);
    if (!(username || email)) {
      return res.status(401).json({
        success: false,
        message: "Username or email is required...",
      });
    }
    /**valid user */
    const validUser = await userModel.findOne({
      $or: [{ username }, { email }, {role}],
    });
    console.log(`the valid user : ${validUser}`);
    /**compare the passwords */
    console.log(`Stored hash passwords : ${validUser.password}`);
    const isValidPassword = await validUser.isPasswordCorrect(password);
    console.log("The compare passwords :", isValidPassword);
    if (!isValidPassword) {
      throw new Error("Invalid users credentials..");
    }
    /**logged user info */
    const loggedUser = await userModel.findById(validUser._id).select("-password");
    console.log(`The logged user info : ${loggedUser}`);
    /**create the access token and refresh token */
    const accessToken = await createAccess_token(
      loggedUser.email,
      loggedUser._id,
      loggedUser.role // add here 
    );
    console.log("the access token while the user wants to login : ",accessToken);
    const refreshToken = await createRefresh_token(
      loggedUser.email,
      loggedUser._id
    );
    console.log("The refresh token while the user wants to login : ",refreshToken);
    /**cookies generate */
    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 20* 1000
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, {httpOnly:true, secure:true, maxAge: 2 * 60 * 1000})
      .json({
        success: true,
        info: loggedUser.email,
        _accessToken: accessToken,
        _refreshToken: refreshToken,
        message: `${loggedUser.username} successfully logged in !!!`,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**create the refresh access token*/
const refreshAccessToken = async (req, res) => {
  try {
    const blackListed = await Blacklist.findOne({ token: req.cookies.refreshToken || req.headers._refreshtoken });
    if (blackListed) {
      return res.status(401).json({ message: "Token is already destroyed. Please log in again." });
    }
    let loginInfo = await userModel.findOne({ email: req.decode.email });
    console.log("The login-info :", loginInfo);
    if (!loginInfo) {
      return res.status(500).json({ message: "Something went wrong..." });
    }
    return res.status(200).json({
      email: loginInfo.email,
      _newAccessToken: await createAccess_token(loginInfo.email, loginInfo._id, loginInfo.role),
      message: "Access token is refreshed successfully..",
    });
  } catch (error) {
     console.error(error);
      return res.status(500).json({message: "Error refreshing access token.."})
  }

  // try {
  //   const authHeader = req.headers.authorization || '';
  //   const refreshToken = authHeader.startsWith('Bearer ') ? authHeader.split(" ")[1] : null;
  //   if(!refreshToken){
  //     return res.status(401).json({message: "Refresh token is missing. Unauthorized request.."})
  //   }
  //   const isBlackListed = await Blacklist.findOne({token: refreshToken});
  //   if(isBlackListed){
  //     return res.status(401).json({message:"Refresh token is blacklisted.."})
  //   }
  //   const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);
  //   console.log("The decoded for the refresh access token: ", decoded);
  //   const user = await userModel.findById(decoded._id);
  //   console.log("The user for the refresh access token : ", user);
  //   if(!user){
  //     return res.status(401).json({message:"Invalid refresh token.."})
  //   }
  //   const access_token = await createAccess_token(user.email, user._id, user.role);
  //   console.log("The access_token is created with the help of refresh token: ", access_token);
  //   return res.status(200).json({
  //     success: true,
  //     _newAccessToken: access_token,
  //     message: "Access token is refreshed success fully.."
  //   })
  // } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({message: "Error refreshing access token.."})
  // }
};
/**user new password set  */
const changePassword = async (req, res) => {
  // res.status(200).json({message:"The new password is set successfully. Now you can login with the new password.."})
  const { oldPassword, newPassword } = req.body;
  console.log("The old password : ", oldPassword);
  console.log("The new password : ", newPassword);
  if (!oldPassword && !newPassword) {
    return res
      .status(400)
      .json({ message: "The old and new password is required..." });
  }
  if(typeof newPassword !== 'string' || newPassword.trim() === ''){
    return res.status(300).json({success:false, message:"New passwords can not be blank.. "})
  }
  try {
    const user = await userModel.findById(req.decode._id);
    console.log("The user who wants to set the new password : ", user);
    if (!user) {
      return res.status(400).json({ message: "User not found..." });
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    console.log("The user correct old password ", isPasswordCorrect);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Old password is incorrect..." });
    }
    /**hash save the password */
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json({ message: "The password is set successfully.." });
  } catch (error) {
    console.error("Error changing password : ", error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};
/**get the current user */
const getCurrentUser = async (req, res) => {
  res
    .status(200)
    .json({
      success: true,
      info: req.decode._id,
      message: "The current user information...",
    });
};

/**user logout function in user.controller*/
const logout = async (req, res) => {
  // return res.status(200).json({message:"The user logout successfully.."})
  console.log("The req.user req.user.refreshToken : ", req.user.refreshToken);
  const token = req.user.refreshToken;
  console.log("The blacklisted refresh token logout :", token);
  try {
    /**when the user logout, the token is saved or created  to the blacklists model */
    const savedToken = await Blacklist.create({ token: token });
    console.log(
      "The retrieved refresh token form the blacklists : ",
      savedToken
    );
    await userModel.findByIdAndUpdate(
      { _id: req.user.id },
      { $unset: { refreshToken: null } },{new:true}
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: `${req.user.username},logout successfully...` });
   
  } catch (error) {
    console.error("The error during logout :", error);
    return res.status(500).json({ message: "Internal server error..." });
  }
};
/**delete the users  */
const  deleteUser = async(req,res)=>{
  // return res.status(200).json({message:"The user data is deleted.."});
  try {
    const {id} = req.params;
    console.log("The id : ", id);
    if(!mongoose.isValidObjectId(id)){
      return res.status(500).json({message:"Invalid ID is there.."})
    }
    /**This way, admins will be able to delete any user's account, while non-admin users will still only be able to delete their own accounts. */
    const deleteById = await userModel.findById(id);
    console.log("The delete the data..", deleteById);
    if(!deleteById){
      return res.status(404).json({message: "The user data is invalid.."})
    }
    if(req.decode.role === "admin"){
      await userModel.findByIdAndDelete(id);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(200).json({success: true, message:"Your info is deleted successfully by admin..."})
    } 
     if(req.decode._id !== id){
      return res.status(403).json({message:"Only you can delete your own account.."})
    }
      await userModel.findByIdAndDelete(id);  
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(200).json({
        success: true,
        message:"Your info is deleted successfully..."
      })
  } catch (error) {
      return res.status(500).json({success: false, message: "The user is not in the lists..."})
  }
}
/**update the user details */
const getUpdateUserDetails = async (req, res) => {
  if (req.method == "PATCH" || req.method == "PUT") {
    // return res.status(200).json({message : "The user details are updated.."})
    /**the rest of the code will write here */
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(500).json({ message: "Invalid ID is there.." });
    }
    console.log("The req.body : ", req.body);
    const existingUserId = await userModel.findById(req.params.id).select("-_id -password -refreshToken");
    if(!existingUserId){
        return res.status(500).json({message:"User not found.."})
    }
   console.log("The user id:", existingUserId);
    const { username, email } = req.body;
    console.log(`The username ${username} and email ${email}`);
    let updatedData = {...req.body};
    delete updatedData.refreshToken;
    let changes = Object.keys(updatedData).some(
        key => updatedData[key] && updatedData[key] !== existingUserId[key]
    )
    if(!changes){
        return res.status(200).json({
            success: true,
            message:"The user details are remains same as you do not update any details.",
            info: existingUserId
        })
    }
    let updateUserDetails = await userModel.findByIdAndUpdate(
      req.params.id,
    //   { $set : {
    //     username : req.body.username,
    //     email: req.body.email
    //   } },
        updatedData,
      { new: true }
    ).select("-_id -password -refreshToken");
    if (!updateUserDetails) {
      return res
        .status(404)
        .json({ message: "User details are not updated..." });
    }
    console.log("The user details are updated : ", updateUserDetails);
    return res
      .status(200)
      .json({ success: true, info : updateUserDetails, message: "Account details are updated.." });
  } else {
    res
      .status(500)
      .json({ success: false, message: `${req.method} is not supported..` });
  }
};
module.exports = {
  register,
  login,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  logout,
  deleteUser,
  getUpdateUserDetails,
};
console.log("The user controller is ready to use...");

  // console.log("The req.user req.user.refreshToken : ", req.user.refreshToken);
  // // const tokenArray = req.headers.authorization || "";
  // //   const token = req.cookies.refreshToken || req.header("Authorization").replace("Bearer "," ");
  // // const token = tokenArray.split(" ")[1];
  // // console.log("The blacklisted refresh token logout :", token);
  // const token =  req.user.refreshToken;
  // if (!token) {
  //   return res.status(400).json({ message: "Refresh token is missing..." });
  // }