import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        dropDups: true
    },
    password: String,
    userRole: Number,
    hospitalId: mongoose.Types.ObjectId
}, { timestamps: true });

const Admin = mongoose.model('admins', AdminSchema)

export default Admin
