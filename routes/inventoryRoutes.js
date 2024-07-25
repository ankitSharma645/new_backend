import express from 'express'
import InventoryController from '../controllers/inventoryController.js'
import {adminAuth} from '../middlewares/validation/auth.js'
import {addStockValidation} from '../middlewares/validation/inventoryManagement.js'

const router = express.Router()
const inventoryController=new InventoryController()

router.post('/addstock',[adminAuth, addStockValidation], inventoryController.addStock.bind(inventoryController))

export default router