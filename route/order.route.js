const express = require('express');
const orderRoute = express.Router();
const {addToCart, billInfo} = require("../controllers/order.controller");
const { verifyAccessToken } = require("../middlewares/auth.middleware");
const { isUser } = require('../middlewares/role_based.middleware');
orderRoute.post("/add-to-cart",verifyAccessToken,isUser, addToCart);
orderRoute.post("/bill-info/:id", verifyAccessToken, isUser,billInfo);
module.exports = orderRoute;
console.log("The order route is ready to use..");