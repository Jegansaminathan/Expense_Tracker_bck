let express=require('express')
let protect=require('../middleware/auth')
const { expenseAdd, expenseGet, expenseDel, expenseDwn } = require('../controller/expencectl')
let ert=express.Router()
ert.post("/add",protect,expenseAdd)
ert.get("/get",protect,expenseGet)
ert.get("/downloadexcel",protect,expenseDwn)
ert.get("/delete/:did",protect,expenseDel)
module.exports=ert