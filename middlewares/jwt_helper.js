const jwt = require("jsonwebtoken");
/**create the access token */
const crypto = require("crypto");
const userModel = require("../models/user.model");
require("dotenv").config();
/**generate the random token */
function generateRandomToken(length) {
  return crypto.randomBytes(length).toString("Hex");
}
/**generate the access key */
const accessKey = process.env.ACCESS_KEY || generateRandomToken(32);
const createAccess_token = async (email, id, role) => {
  console.log("The access key while we create it for the login purpose : ", accessKey);
  if (accessKey) {
    //add here 
    const access_token = jwt.sign({ _id: id, email: email, role:role === 'admin' ? 'admin' : 'user' }, accessKey, {
      expiresIn: "30s",
    });
    return access_token;
  }
};
/**generate the refresh key */
const refreshKey = process.env.REFRESH_KEY || generateRandomToken(64);
const createRefresh_token = async (email, id) => {
  console.log("the refresh key while we create it for the login purpose : ", refreshKey);
  if (refreshKey) {
    const refresh_token = jwt.sign({ _id: id, email: email, type: 'refresh' }, refreshKey, {
      expiresIn: "2m",
    });
    await userModel.findByIdAndUpdate(id, {refreshToken: refresh_token}  );
    return refresh_token;
  }
};
module.exports = { createAccess_token, createRefresh_token };
console.log("The access and refresh token is ready to use..");