const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
/**define the user model */
const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true,"Please enter the username"]
    },
    email:{
        type: String,
        required:[true,"Please enter the email"]
    },
    password:{
        type: String,
        required:[true,"Please enter the password"]
    },
    refreshToken:{
        type: String,
    },
    role:{
        type: String,
        enum:["admin","user"],  // Define possible roles
        default: 'user' // Default role is user
    }
},{timestamps:true,versionKey:false})

/**compare the passwords */
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}
const userModel = mongoose.model("userModel", userSchema,"users");
module.exports = userModel;
console.log("The user model is ready to use !!")