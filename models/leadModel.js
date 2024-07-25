import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  reasonForInquiry: {
    type: String,
    required: true,
  },
  status:{
    type:String,
    enum:["PENDING","IN-TOUCH","CLOSED"],
    default:"PENDING",
   },
},{timestamps:true});

const HospitalLead = mongoose.model('leads', leadSchema);

export default HospitalLead;
