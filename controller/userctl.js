const userm = require("../model/usermod");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

let generateToken=(_id)=>{
   return jwt.sign({_id}, process.env.JwtSecretkey, {expiresIn: "1h",});
}
let reg = async (req, res) => {
  const { email, name, pwd } = req.body || {};
  if (!email || !name || !pwd) {
    return res.status(400).json({ msg: "all field is required" });
  }
  try {
    const existuser = await userm.findOne({"email": email });
    if (existuser) {
      return res.status(400).json({ msg: "user already exist" });
    }
    let hashpwd = await bcrypt.hash(pwd, 10);
    let data = await userm.create(
      { email: email, name: name, pwd: hashpwd }
    );
    let tkn= generateToken(data._id)
    const {pwd:pas,...userobj}=data.toObject()
    res.status(201).json({token:tkn,userobj});
  } catch(err){
    console.error(err);
    res.status(500).json({ msg: "error in adding user" });
  }
};

let login = async (req, res) => {
  const { email, pwd } = req.body || {};
  if(!email || !pwd){
    return res.status(400).json({"msg":"all field is required"})
  }
  try {
    let obj = await userm.findOne({"email":email});
    if (obj) {
      let sign = await bcrypt.compare(pwd, obj.pwd);
      if (sign) {
        let tkn = generateToken(obj._id)
        const {pwd:pas,...userobj}=obj.toObject()
        res.status(200).json({token: tkn,userobj});
      } 
      else {
        res.status(400).json({ msg: "incorrect pass" });
      }
    } else {
      res.status(400).json({ msg: "check email" });
    }
  } catch {
    res.status(500).json({ msg: "error in login" });
  }
};
let getuinfo = async (req, res) => {
  try{
    let usr=await userm.findById(req.user._id).select("-pwd")
    if(!usr){
      return res.status(404).json({msg:"user not found"})
    }
    res.status(200).json({usr})
  }
  catch{
    res.status(500).json({msg:"error in registering user"})
  }
  
};
module.exports = { reg, login ,getuinfo};