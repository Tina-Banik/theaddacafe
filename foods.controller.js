const multer = require("multer");
const uploadObj = require("../file_upload/file_upload_config");
const foodModel = require("../models/food.model");
const { default: mongoose } = require("mongoose");
const fs = require("fs");
const path = require("path");
const deleteFile = (filename) => {
  const pathFile = path.join(
    __dirname,
    "../public/uploads/foods",
    filename.replace(/^.*[\\\/]/, "")
  );
  console.log(`The file path : ${pathFile}`);
  console.log(`The file name : ${filename}`);
  return new Promise((resolve,reject)=>{
    if(fs.existsSync(pathFile)){
      fs.unlink(pathFile,(err)=>{
        if(err){
          reject(err);
        }else{
          console.log(`The ${filename} is deleted successfully...`);
           resolve();
        }
      })
    }else{
      console.log(`The ${filename} is not deleted successfully...`);
      resolve();
    }
  })
}
/**inserting the food items */
const addNewFood = async (req, res) => {
  // res.status(200).json({message: "The new food is inserted..."})
  let upload = uploadObj.single("image");
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err });
    } else if (err) {
      return res.status(500).json({
        Error: err,
        message: "Only *jpg, *jpeg, *png file will upload..",
      });
    }
      const { food, description, price, stock } = req.body;
      // console.log("The details are : ", food, description, price, stock);
    try {
      let newFood = await foodModel.create({
        food,
        description,
        price,
        image: `${process.env.BASE_URL}/foods/${req.file.filename}`,
        stock
      });
      console.log("The new food items are listed : ", newFood);
      if(newFood){
        return res.status(200).json({success: true, result: newFood, message:"The new food items are inserted.."})
      }else{
        return res.status(500).json({status: false, message:"The data is not valid.."})
      }
    } catch (error) {
        console.error("The food is not inserted : ", error);
       if(!food || !description || !price || !req.file|| !stock){
          console.log("The missing fields : " , !food ? "food" : !description ? "description" : !price ? "price" : !req.file ? "image" : !stock ? "stock" : "");
          const missingFields = !food ? "food" : !description ? "description" : !price ? "price" :  !req.file ? "image" : !stock ? "stock" : "";
          console.log("The missing fields ", missingFields);
          return res.status(500).json({status:false, message:`The missing fields : ${missingFields}`})
       }
    }
  });
};
/**get all the food lists */
const getAllFoodLists = async(req,res)=>{
  // return res.status(200).json({message: "The all the food lists are here.."})
    try {
      let allFoodLists = await foodModel.find().exec();
      console.log("All the food lists : ", allFoodLists);
      return res.status(200).json({success: true, info: allFoodLists, message:"All the food lists are listed below.."})
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message:"There is no food lists.."})
    }
}
/**get the foods by their ID */
const getItemsById = async(req,res)=>{
 const getItemsById = req.params.id;
  console.log("The food items by ID : ", getItemsById);
    try {
      if(!mongoose.isValidObjectId(getItemsById)){
        return res.status(500).json({success: false, message: "The id is not valid object.."})
      }
      let findFoodItem = await foodModel.findById({_id : getItemsById});
      return res.status(200).json({success: true, info : findFoodItem ,message: "The food item is found.."})
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message:"The food items are not found.."})
    }
}
/**get the items within the price limit */
const getItemsPriceLimit = async(req,res)=>{
  // return res.status(200).json({success:true, message:"The food items are listed by price.."})
  let start = req.params.st;
  let end = req.params.en;
  console.log("The start and end price : ", start, end);
  try {
    if(start >= 0){
      let findItem = await foodModel.find({price : {$gt:start , $lt:end}});
      console.log("The find item is found : ", findItem);
      if(findItem.length === 0){
        return res.status(404).json({success: false, message:"No items found within this price range"})
      }else{
        return res.status(200).json({
        success: true,
        message:`The food items are ${start} and ${end} is listed below`,
        info: findItem
      })
      }
    }else{
      return res.status(500).json({success: false, message:"Invalid price range. Starting price cannot be negative."})
    }
  } catch (error) {
      console.error(error);
      return res.status(500).json({success: false, message:"The food items are not available between this price limit"})
  }
 
}
/**delete the food items */
const deleteFood = async(req,res)=>{
    // return res.status(200).json({message:"This food items are deleted.."});
    try {
      const {id} = req.params;
      if(!mongoose.isValidObjectId(id)){
        return res.status(500).json({success: false, message:"The food id is not valid.."})
      }
      let deleteFoodItems = await foodModel.findById(id);
      console.log(`The deleted food items : ${deleteFoodItems}`);
      await deleteFile(deleteFoodItems.image);
      await foodModel.findByIdAndDelete(id);
      if(!deleteFoodItems){
        return res.status(404).json({
          success:false, message: "The food id is not deleted.."
        })
      }
      res.status(200).json({
        success: true,
        message:"The food info is deleted..",
        info: deleteFoodItems
      })
    } catch (error) {
      console.error(error);
        return res.status(500).json({success:false, message:"The food items are not in the lists.."})
    }
}
/**update the food items */
const updateFoodItems = async(req,res)=>{
  // return res.status(200).json({success:true,message:"The food items are updated.."})
  if(req.method == 'PUT' || req.method == 'PATCH'){
    // return res.status(200).json({success:true,message:"The food items are updated.."})
    const upload = uploadObj.single("image");
    upload(req,res, async function (error){
      if(error instanceof multer.MulterError){
        return res.status(500).json({Error: error})
      }else if(error){
          return res.status(500).json({success: false, message:"Only *jpg, *jpeg, *png file will upload.."})
      }
      let currentFoodItem =  await foodModel.findById(req.params.id);
       if(!currentFoodItem){
        return res.status(400).json({success:false, message:"The food id is not valid"})
       }

      let updateData = {...req.body};
      if(req.file && req.file.filename){
          updateData.image = `${process.env.BASE_URL}/foods/${req.file.filename}`,
          {new:true}
    }
      let changes = Object.keys(updateData).some(
        key => updateData[key] !== currentFoodItem[key]
      );
      console.log("The changes : ", changes);
      if(!changes){
        return res.status(200).json({success: false, message:"The food details are remains same as you do not update any details.", info: currentFoodItem})
      }
        let updateFoodItem = await foodModel.findByIdAndUpdate(
          req.params.id,
         updateData,
          {new:true}
        );
        console.log("The updateFoodItem : ", updateFoodItem);
        if(!updateFoodItem){
          return res.status(500).json({success:false, message:"The food details are not updated.."});
        }
        console.log("The updated food items : ", updateFoodItem);
        const message = req.file && req.file.filename ? "The food details are updated with the image" : "Only food details are updated";
        return res.status(200).json({success:true, message, info:updateFoodItem})
  })
}else{
    res.status(500).json({
      success: false,
      message:`${req.method} is not supported..`
    })
  }
}

module.exports = { addNewFood, getAllFoodLists, getItemsById, getItemsPriceLimit, deleteFood, updateFoodItems };
console.log("The food controller is ready to use..");