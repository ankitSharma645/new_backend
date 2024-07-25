import mongoose from "mongoose";

const remarkSchema= new mongoose.Schema({
    remark:{
        type:String,
        required:true
    },
    type:{
        type:String
    },
    isActive:{
        type:Boolean, default:true
    },
    hospitalId: mongoose.Types.ObjectId,
})

const Remark = mongoose.model('remarks', remarkSchema);
export default Remark;