let express=require('express')
let protect=require('../middleware/auth')
const { incomeAdd, incomeGet, incomeDel, incomeDwn } = require('../controller/incomectl')
let irt=express.Router()
irt.post("/add",protect,incomeAdd)
irt.get("/get",protect,incomeGet)
irt.get("/downloadexcel",protect,incomeDwn)
irt.get("/delete/:did",protect,incomeDel)
module.exports=irt