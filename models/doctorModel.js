import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hospitalId: mongoose.Types.ObjectId,
    experience: { type: String },
    qualifications: [String],
  },
  { timestamps: true }
);

const Doctor = mongoose.model("doctors", doctorSchema);
export default Doctor;
