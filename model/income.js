let mongoose=require('mongoose')
let incsch=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'user',required:true},
    icon:{type:String},
    source:{type:String,required:true},
    amount:{type:Number,required:true},
    date:{type:Date,default:Date.now}
},{timestamps:true}
)
let incomem=mongoose.model('income',incsch)
module.exports=incomem