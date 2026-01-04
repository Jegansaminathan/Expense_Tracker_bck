let jwt=require('jsonwebtoken');
const userm = require('../model/usermod');

let protect=async(req,res,next)=>{
    let token=req.headers.authorization?.split(" ")[1]
    if(!token) return res.status(401).json({msg:"Not auth, no token"});
    try{
        //authontication
        const decoded=jwt.verify(token,process.env.JwtSecretkey)
        //authorization like(user is(deleted,bolcked,//rolechanged) )
        req.user=await userm.findById(decoded._id).select("-pwd")
        next()
    }
    catch{
        res.status(401).json({msg:"not auth, token failed"})
    }
}
module.exports=protect