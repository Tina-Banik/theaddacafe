const userModel = require("../models/user.model");
const foodModel = require("../models/food.model");
const orderModel = require("../models/order.model");
const { default: mongoose } = require("mongoose");

/**add to the cart function */
const addToCart = async(req,res)=>{
    // return res.status(200).json({success:true, message:"The food items is added to the cart.."})
    try {
        /**1.validate the request body */
        const {user_id, food_id, quantity} = req.body;
        if(!mongoose.isValidObjectId(user_id) || !mongoose.isValidObjectId(food_id)){
            return res.status(401).json({success: false,message: "Invalid Object ID.."})
        }
        console.log(`The user_id ${user_id} and food_id ${food_id}`);
        /**2.check the food availability */
        const food = await foodModel.findById(food_id);
        console.log("The food items is available in the lists : ", food);
        if(!food){
            return res.status(500).json({success:false, message:"The food items is not found.."})
        }
        console.log(`Requested quantity : ${quantity} , available stock : ${food.stock}`);
        const requestedQuantity = Number(quantity);
        const availableStock = Number(food.stock);
        /**3. check the food stock */
        console.log(`Checking if available stock (${availableStock}) is less than requested quantity (${requestedQuantity})`);
        if(food.Stock < requestedQuantity){
            console.log(`Insufficient food only. Only ${food.stock || 0} available`)
            return res.status(400).json({success:false, message:`Insufficient food only. Only ${food.stock || 0} available`})
        }
        console.log("Stock is sufficient. Proceeding to the cart...");
       /**4.find users cart */
       console.log('User ID : ', user_id);
       let cart = await orderModel.findOne({user_id});
       console.log("The users cart : ", cart);
       if(!cart){
            // If no cart exists, create a new one for the user
            cart= new orderModel({user_id, items:[{food_id, quantity: requestedQuantity}]});
            await cart.save();
            console.log("A new cart is created with items : ", cart);
       }
       /**5.  If cart exists, check if the food is already in the cart*/
        let existingItem = cart.items.findIndex(items => items.food_id.toString() === food_id.toString());
        console.log("the existing items on the cart : ", existingItem);
        /**6.add/update food items in the cart */
        if(existingItem !== -1){
            cart.items[existingItem].quantity += requestedQuantity; // If the item exists in the cart, update its quantity
        }else{
            cart.items.push({food_id, quantity: requestedQuantity}) // If the item doesn't exist, add it to the cart
        }   
        console.log("the saving cart : ", cart);
        await cart.save();
        food.stock -= 1;
        await food.save();
        await cart.save();
        return res.status(200).json({success:true, message:"The food items are added to the cart.."})
    //    console.log("The items are added to the cart..");

    } catch (error) {
        return res.status(500).json({
            success: false,
            message:"The Error adding to the cart.."
        })
    }
}
/**bill info generate */
const billInfo = async(req,res)=>{
    // return res.status(200).json({success: true, message:"The bill info is generated.."})
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.send("Invalid Object ID..")
    }
    /**generate the bill-info */
    let order = await orderModel.findById(req.params.id);
    console.log("Before populate: ", order.items);
    await order.populate("items.food_id");
    console.log("After populate: ", order.items);
    let billPrice = await orderModel.findById({_id: req.params.id}).populate("user_id","-email -password -role");
    // await billPrice.populate("items.food_id");
    console.log("The bill-info : ", billPrice);
    const totalBill = order.items.reduce((total, item)=>{
        return total + (item.food_id.price * item.quantity);
    },0)
    // console.log("The total bill : ", totalBill);
    return res.status(200).json({success: true, message: "The bill is ready.", Total: totalBill})
}
module.exports = {addToCart, billInfo};
console.log("The oder controller is ready to use..")