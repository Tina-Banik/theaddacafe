const mongoose = require("mongoose");
/** create the order model */
const orderSchema = mongoose.Schema({
    order_date:{
        type: Date,
        default: Date.now()
    },
    /**reference the user id */
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "userModel"
    },
    items:[{
        /**reference to the food id */
       
        food_id:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref: "foodSchema"
        },
        quantity:{
            type:Number,
            required:[true,"Please enter the quantity of the items"],
            min: 1, /**enforce to order the minimum 1 */
        }
    }]
},{timestamps:true, versionKey:false});
const orderModel = mongoose.model("orderModel",orderSchema,"orders");
module.exports = orderModel;
console.log("The order model is ready to use..")