const expmod=require("../model/expense")
const xlsx=require('xlsx')

let expenseAdd=async(req,res)=>{
    const{icon,category,amount,date}=req.body
    if(!category||!amount){
        return res.status(400).json("all fields are required")
    }
    const userid=req.user._id
    try{
        let data=new expmod({userId:userid,icon,category,amount,date})
        await data.save()
        res.status(201).json({"msg":"expense added sucessfully"})
    }
    catch{
        res.status(500).json({"msg":"internal server error in adding expense"})
    }
}

let expenseGet=async(req,res)=>{
    let userid=req.user._id
    try{
        let data=await expmod.find({userId:userid}).sort({date:-1})
        res.status(200).json(data)
    }
    catch{
        res.status(500).json({"msg":"internal error in getting user expense"})
    }
}

let expenseDel=async(req,res)=>{
    try{
        await expmod.findByIdAndDelete(req.params.did)
        res.status(200).json({"msg":"expense deleted secussfully"})
    }
    catch{
        res.status(500).json({"msg":"internal error in deleting expense"})
    }
}

let expenseDwn=async(req,res)=>{
    const userid=req.user._id
    try{
        let data=await expmod.find({userId:userid}).sort({"date":-1})
        let xldata=data.map((item)=>({
            Category:item.category,
            Amount:item.amount,
            Date:item.date.toDateString()
        }))
        let wb=xlsx.utils.book_new();
        let ws=xlsx.utils.json_to_sheet(xldata)
        xlsx.utils.book_append_sheet(wb,ws,"expence")
        xlsx.writeFile(wb,"Expense_sheet.xlsx")
        res.download("Expense_sheet.xlsx")
    }
    catch{
        res.status(500).json({"msg":"internal error in downloading expense"})
    }
}
module.exports={expenseAdd,expenseDel,expenseDwn,expenseGet}