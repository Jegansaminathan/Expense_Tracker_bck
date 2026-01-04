const { Types, isValidObjectId } = require('mongoose')
let incomem=require('../model/income')
const expmod = require('../model/expense')
let getdash=async(req,res)=>{
    const userid=req.user._id
    //find() auto-converts (casts) strings → ObjectId---aggregate() does NOT auto-convert
    const uobjId=new Types.ObjectId(userid)
try{
    const totalincome=await incomem.aggregate([{$match:{userId:uobjId}},{$group:{_id:null,total:{$sum:"$amount"}}}])
    console.log("total_income",{totalincome,userId:isValidObjectId(uobjId)})


    const totalexpense=await expmod.aggregate([{$match:{userId:uobjId}},{$group:{_id:null,total:{$sum:"$amount"}}}])
    console.log("total_expense",{totalexpense,userId:isValidObjectId(uobjId)})


    const income60days=await incomem.find({userId:uobjId,date:{$gt:new Date(Date.now()-60*24*60*60*1000)}}).sort({date:-1})
    const tincome60days=income60days.reduce((sum,trans)=>sum+trans.amount,0)


    const expense30days= await expmod.find({userId:uobjId,date:{$gt:new Date(Date.now()-30*24*60*60*1000)}}).sort({date:-1})
    const texpense30days=expense30days.reduce((sum,trans)=>sum+trans.amount,0)


    const last5trans=[
        //toObject() because obj is not a normal js obj it is mongoos document(it contains like It has Mongoose metadata
        //It has methods like .save(), .populate(), .isModified Some fields are getters, not raw values)
        //Spread works correctly only on plain JS objects
        ...(await incomem.find({userId:uobjId}).sort({date:-1}).limit(5)).map((obj)=>({...obj.toObject(),type:"income"})),
        ...(await expmod.find({userId:uobjId}).sort({date:-1}).limit(5)).map((obj)=>({...obj.toObject(),type:"expense"}))
    ].sort((a,b)=>b.date - a.date)
    res.json({
        "totalBalance":(totalincome[0]?.total??0)-(totalexpense[0]?.total??0),
        "totalIncome":(totalincome[0]?.total??0),
        "totalExpense":(totalexpense[0]?.total??0),
        "last30daysexpense":{
            "last30days":expense30days,
            "total":texpense30days
        },
        "last60daysincome":{
            "last60days":income60days,
            "total":tincome60days
        },
        "recenttrans":last5trans
    })
}
catch{
    res.status(500).json({"msg":"internal error in getdash"})
}
}
module.exports={getdash}