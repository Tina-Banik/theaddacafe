const express = require("express");
const userRoute = express.Router();
const { register,login,refreshAccessToken,changePassword,getCurrentUser,logout, deleteUser,getUpdateUserDetails } = require("../controllers/users.controller");
const { veriFyRefreshToken, verifyAccessToken } = require("../middlewares/auth.middleware");
const { verifyJWT } = require("../middlewares/logout.middleware");
const { checkBlacklists } = require("../middlewares/checkBlacklists.middleware");
const { isAdmin } = require("../middlewares/role_based.middleware");
userRoute.post("/user-register", register);
userRoute.post("/user-login", login);
userRoute.post("/new-access-token",   checkBlacklists, veriFyRefreshToken , refreshAccessToken);
userRoute.post("/user-new-password", checkBlacklists, veriFyRefreshToken, changePassword);
// userRoute.post("/admin/user-new-password", checkBlacklists, veriFyRefreshToken, isAdmin, changePassword);
userRoute.get("/get-current-user", verifyAccessToken,getCurrentUser);
userRoute.post("/user-logout",verifyJWT, checkBlacklists,logout);
userRoute.delete("/user-account-delete/:id", verifyAccessToken, deleteUser);
// userRoute.all("/update-user-details/:id", checkBlacklists,veriFyRefreshToken,getUpdateUserDetails);
userRoute.all("/update-user-details/:id", veriFyRefreshToken, checkBlacklists, getUpdateUserDetails);

// userRoute.all("/update-user-details/:id", verifyAccessToken,getUpdateUserDetails);
// userRoute.post("/user-logout", veriFyRefreshToken,checkBlacklists,logout); 
module.exports = userRoute;
console.log("The user route is ready to use.");