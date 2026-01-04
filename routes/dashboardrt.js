let express=require("express")
const { getdash } = require("../controller/dashboardctl")
const protect = require("../middleware/auth")
let dashrt=express.Router()
dashrt.get("/getdetails",protect,getdash)
module.exports=dashrt
