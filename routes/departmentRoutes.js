import express from 'express'
import DepartmentController from '../controllers/departmentController.js'
import { getDepartmentValidation } from '../middlewares/validation/department.js'
import { adminAuth } from '../middlewares/validation/auth.js'

const router = express.Router()
const DepartmentControllers=new DepartmentController()

router.get('/getAllDepartment',[adminAuth,getDepartmentValidation], DepartmentControllers.getAllDepartment)

export default router