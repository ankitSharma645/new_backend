import express from 'express'
import RemarkController from '../controllers/remarkController.js'
import {adminAuth} from '../middlewares/validation/auth.js'

const router = express.Router()
const remarkController = new RemarkController()

router.post('/addremark',[adminAuth], remarkController.addRemark.bind(remarkController))
router.get('/getremarks',[adminAuth], remarkController.getRemarks.bind(remarkController))

export default router