import express from 'express'
import { adminAuth } from '../middlewares/validation/auth.js'
import DashboardController from '../controllers/dashboardController.js'

const router = express.Router()
const dashboardController = new DashboardController()

router.get('/getCardsData',[adminAuth], dashboardController.getCardsData)

export default router