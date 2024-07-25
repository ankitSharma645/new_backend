import mongoose from "mongoose";

const labtestSchema= new mongoose.Schema({
    testName:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean, default:true
    },
    hospitalId: mongoose.Types.ObjectId,
})

const Labtest = mongoose.model('labtests', labtestSchema);
export default Labtest;