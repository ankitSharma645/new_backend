import mongoose from "mongoose";

const medicineSchema= new mongoose.Schema({
    medicineName:{
        type:String,
        required:true
    },
    genericName:{
        type:String
    },
    manufacturedBy:{
        type:String
    },
    quantity:{
        type: Number, default:0
    },
    isActive:{
        type:Boolean, default:true
    },
    hospitalId: mongoose.Types.ObjectId,
})

const Medicine = mongoose.model('medicine', medicineSchema);
export default Medicine;