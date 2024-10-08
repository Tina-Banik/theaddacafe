const mongoose = require("mongoose");
const blacklistsSchema = mongoose.Schema({
    token:{
        type: String,
        required: true,
        unique: true
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        expires:"20s"
    }
})
const blacklistsModel = mongoose.model("blacklistsModel",blacklistsSchema,"blacklist");
module.exports = blacklistsModel;
console.log("the black list model is ready to use...");