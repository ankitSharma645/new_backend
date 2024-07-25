import express from 'express'
import LabtestController from '../controllers/labtestController.js'
import {adminAuth} from '../middlewares/validation/auth.js'

const router = express.Router()
const labtestController = new LabtestController()

router.get('/getlabtests',[adminAuth], labtestController.getLabtests.bind(labtestController))

export default router