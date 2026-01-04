let express=require('express')
const { login, reg, getuinfo } = require('../controller/userctl')
const protect = require('../middleware/auth')
let urt=express.Router()
urt.post('/login',login)
urt.post('/reg',reg)
urt.get('/getUserInfo',protect,getuinfo)
module.exports=urt