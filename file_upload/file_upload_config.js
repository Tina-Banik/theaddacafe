const multer = require("multer");
const fileStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, "public/uploads/foods")
    },
    filename: function(req,file,cb){
        cb(null, Date.now()+'-'+file.originalname);
    }
})

const uploadObj = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter: ((req,file,cb)=>{
        const allowedMimeTypes = ["image/jpg", "image/jpeg", "image/png"];
        if(allowedMimeTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(new Error("Only jpeg and jpg and png images are allowed"), false)
        }
    }),
    storage: fileStorage
})
module.exports = uploadObj;
console.log("The file upload is ready to use..");