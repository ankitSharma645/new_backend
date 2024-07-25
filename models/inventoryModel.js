import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    medicineId: {type:mongoose.Types.ObjectId, ref:'medicine'},
    hospitalId: mongoose.Types.ObjectId,
    batchNumber: { type: String },
    quantity: { type: Number },
    mfgDate: { type: Number },
    expDate: { type: Number },
    type: {
        type: String,
        enum: ['INBOUND', 'OUTBOUND']
    },
    comments: {type: String},
    createdAt: { type: Date, default: Date.now }

})

const Inventory = mongoose.model('inventory', inventorySchema);
export default Inventory