import express from 'express'
import admin from '../controllers/adminController.js'
import { adminLoginValidations, changePasswordValidation } from '../middlewares/validation/admin.js'
import { adminAuth } from '../middlewares/validation/auth.js'


const router = express.Router()
const adminController=new admin()

router.post('/login',[adminLoginValidations], adminController.login)
router.get('/getAllUsers',[adminAuth],adminController.userList)
router.patch('/changePassword',[changePasswordValidation,adminAuth],adminController.changePassword)

router.post('/onboardDoctor', [adminAuth], adminController.onboardDoctor);

export default router