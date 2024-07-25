import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import Inventory from '../models/inventoryModel.js'
import MedicieServices from '../services/medicineServices.js'

const medicineServices = new MedicieServices()

export default class InventoryServices {
    constructor() { }

    async addStock(inventoryObj){
        try {

            inventoryObj.type = 'INBOUND'

            let invObj = await Inventory.create(inventoryObj)
            invObj =  invObj.save()

            const isQuantityUpdated = await medicineServices.udpateStock(inventoryObj.medicineId, 'INC', inventoryObj.quantity)
            if(!isQuantityUpdated){
                console.log('Quantity not updated for '+JSON.stringify(inventoryObj))
            }

            return invObj
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

}