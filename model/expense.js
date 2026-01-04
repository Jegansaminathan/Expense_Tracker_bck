let mongoose=require('mongoose')
let expsch=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
    icon:{type:String},
    category:{type:String,required:true},
    amount:{type:Number,required:true},
    date:{type:Date,default:Date.now}
},{timestamps:true}
)
let expmod=mongoose.model("expense",expsch)
module.exports=expmod