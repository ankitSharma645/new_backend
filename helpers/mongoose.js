import mongoose from "mongoose";

export const getObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
}