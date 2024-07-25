import express from 'express'
import DoctorController from '../controllers/doctorController.js'
import { changeAppointmentStatusValidation, getAppointmentValidation, getDoctorValidation } from '../middlewares/validation/doctors.js'
import { adminAuth } from '../middlewares/validation/auth.js'

const router = express.Router()
const DoctorControllers=new DoctorController()

router.get('/getAllDoctors',[adminAuth,getDoctorValidation], DoctorControllers.getAllDoctors)
router.get('/getAllAppointments',[adminAuth,getAppointmentValidation],DoctorControllers.getAllAppointment )
router.patch('/changeAppointmentStatus/:doctorId',[adminAuth,changeAppointmentStatusValidation],DoctorControllers.changeAppointmentStatus )

export default router