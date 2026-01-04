const incomem=require("../model/income")
const xlsx=require("xlsx")

let incomeAdd=async(req,res)=>{
    const userid=req.user._id
    const {icon,source,amount,date}=req.body
    if(!source||!amount) return res.status(400).json({'msg':"all fields are required"})
    try{
        let data=new incomem({userId:userid,icon,source,amount,date})
        await data.save()
        res.status(201).json({"msg":"Income Added sucessfully"})
    }
    catch{
        res.status(500).json({"msg":"error in adding income"})
    }

}
let incomeGet=async(req,res)=>{
    const userid=req.user._id
    try{
        let arrobj=await incomem.find({userId:userid}).sort({date:-1})
        res.status(200).json(arrobj)
    }
    catch{
        res.status(500).json({"msg":"server error in geting data"})
    }
}
let incomeDel=async(req,res)=>{
    try{
        await incomem.findByIdAndDelete(req.params.did)
        res.json({"msg":"income delete sucessfully"})
    }
    catch{
        res.status(500).json({"msg":"server error in deleting"})
    }
}
let incomeDwn=async(req,res)=>{
    const userid=req.user._id
    try{
        let incomes=await incomem.find({userId:userid}).sort({"date":-1})
        //prepare xlsx
        let xldata=incomes.map((items)=>{
            return(
                {
                    Source:items.source,
                    Amount:items.amount,
                    Date:items.data
                }
            )
        })
        const wb=xlsx.utils.book_new();
        const ws=xlsx.utils.json_to_sheet(xldata)
        xlsx.utils.book_append_sheet(wb,ws,"Income");
        xlsx.writeFile(wb,"Income_Sheet.xlsx")
        res.download("Income_Sheet.xlsx")
    }
    catch{
        res.status(500).json({"msg":"internal server error in xlsx download"})
    }
}
module.exports={incomeAdd,incomeGet,incomeDel,incomeDwn}