import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code:{
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    logo:{type:String}
}, { timestamps: true });

const Hospital = mongoose.model('hospitals', hospitalSchema);
export default Hospital;
