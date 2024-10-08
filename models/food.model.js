const mongoose = require("mongoose");

/**define the food model */
const foodModel = mongoose.Schema({
    food:{
        type: String,
        required: [true, "Please enter the food name"]
    },
    description:{
        type: String,
        required: [true, "Please enter the food description"]
    },
    price:{
        type:Number,
        required: [true, "Please enter the food price"],
        min:0 /**ensure the price is non-negative */
    },
    image:{
        type: String,
        required:[true,"Please enter the image"]
    },
    stock: {
        type: Number,
        required: true,
        min:0 /**ensure the stock is non-negative  */
    }
},{timestamps:true, versionKey:false})

const foodSchema = mongoose.model("foodSchema", foodModel, "foods");
module.exports = foodSchema;
console.log("The food model is ready to use..");