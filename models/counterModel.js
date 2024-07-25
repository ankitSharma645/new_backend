import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
    patientIdCounter: Number,
    hospitalId: mongoose.Types.ObjectId
}, { timestamps: true });

const Counter = mongoose.model('counter', CounterSchema)

export default Counter