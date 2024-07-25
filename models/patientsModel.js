import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  dob: {
    type: Number
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
    required: true
  },
  email: {
    type: String,
  },
  govtID: {
    type: String,
  },
  emergencyContactName: {
    type: String,
  },
  emergencyContactNumber: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  patientId: { type: String },
  hospitalId: mongoose.Types.ObjectId,
  docs: [
    {
      filePath: String,
      fileName: String,
      fileSize: Number,
      s3url: String,
      uploadedBy: mongoose.Types.ObjectId,
      uploadedAt: Number,
      isActive: Boolean
    }
  ],
  reference: { type: String },
  appointmentNotes:{type : String},
  profilePic:{type:String},
  isVerified:{type:Boolean, default :false},
  age:{type:Number},
  thumbnail:{type:String},
}, { timestamps: true });

const Patients = mongoose.model('patients', PatientSchema)

export default Patients