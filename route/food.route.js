const express = require("express");
const foodRoute = express.Router();

/**here define the controller */
const {addNewFood, getAllFoodLists, getItemsById,getItemsPriceLimit,deleteFood,updateFoodItems} = require("../controllers/foods.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role_based.middleware");
/**here define the route */
foodRoute.post("/add-new-food", verifyAccessToken, isAdmin, addNewFood);
foodRoute.get("/all-food-lists",getAllFoodLists);
foodRoute.get("/items-by-id/:id", getItemsById);
foodRoute.get("/items-price-limit/:st/:en", getItemsPriceLimit);
foodRoute.delete("/delete-food-items/:id", verifyAccessToken, isAdmin, deleteFood);
foodRoute.all("/update-food-items/:id", verifyAccessToken, isAdmin,updateFoodItems);
module.exports = foodRoute;
console.log("The food route is ready to use..")