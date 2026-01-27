let mongoose=require('mongoose')
let usersch=new mongoose.Schema(
    {
    'email':{type:String,required:true,unique:true},
    'name':{type:String,required:true},
    'pwd':{type:String,required:true},
    'resetotp':{ 
        'otp':{type:String},
        'expire':{type:Number},
        'verified': { type: Boolean, default: false }}
},{
    timestamps:true
}
)
let userm=mongoose.model('user',usersch)
module.exports=userm