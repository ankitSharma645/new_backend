import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hospitalId: mongoose.Types.ObjectId
}, { timestamps: true }); 

const Departments = mongoose.model('departments', departmentSchema);

export default Departments
