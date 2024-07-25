import mongoose from "mongoose"
import InventoryServices from "../services/inventoryServices.js"

const inventoryServices = new InventoryServices()

export default class MedicineController {
    constructor() { }

    async addStock(req, res, next) {
        try {

            const { medicineId, hospitalId, batchNumber, quantity, mfgDate, expDate, comments } = req.body

            const inventoryObj = {
                medicineId:new mongoose.Types.ObjectId(medicineId),
                hospitalId:hospitalId,
                batchNumber:batchNumber,
                quantity: quantity,
                mfgDate:mfgDate,
                expDate:expDate,
                comments:comments
            }

            const invObj = await inventoryServices.addStock(inventoryObj)

            return res.status(200).json({ msg: 'Stock Added Successfully', data:invObj })

        } catch (error) {
            next(error)
        }
    }
}