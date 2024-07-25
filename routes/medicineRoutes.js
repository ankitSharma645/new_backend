import express from 'express'
import MedicineController from '../controllers/medicineController.js'
import {adminAuth} from '../middlewares/validation/auth.js'

const router = express.Router()
const medicineController=new MedicineController()

router.post('/addmedicine',[adminAuth], medicineController.addMedicine.bind(medicineController))
router.get('/getmedicine',[adminAuth], medicineController.getMedicine.bind(medicineController))

export default router