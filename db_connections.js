const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set('strictQuery', true);
/**connection to the database */
const db_connection = mongoose.connect(`${process.env.MONGODB_URL }`)
.then(()=>{
    console.log("The MONGODB connection")
})
.catch((error)=>{
    console.error(error);
})
module.exports = db_connection;
console.log("the database string is ready to use");