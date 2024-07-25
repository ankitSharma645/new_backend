import express from 'express'
import AppointmentController from '../controllers/appointmentController.js'
import { addAppointmentValidator, addNotesValidator, addPrescriptionValidator, cancelAppointmentValidator, completeAppointmentValidator, generatePrescriptionValidator, getByPatientValidator, prescriptionValidator, rescheduleAppointmentValidator, sendPrescriptionValidator, singleAppointmentValidator } from '../middlewares/validation/appointment.js'
import { adminAuth } from '../middlewares/validation/auth.js'

const router = express.Router()
const AppointmentControllers=new AppointmentController()


router.get('/getAllAppointment',[adminAuth],AppointmentControllers.appoinmentList)
router.post('/scheduleAppointment',[adminAuth,addAppointmentValidator],AppointmentControllers.scheduleAppointment)
router.put('/addPrescription',[adminAuth],AppointmentControllers.addPrescription)
router.patch('/rescheduleAppointment/:id',[adminAuth,rescheduleAppointmentValidator],AppointmentControllers.rescheduleAppointment)
router.patch('/cancelAppointment/:id',[adminAuth,cancelAppointmentValidator],AppointmentControllers.cancelAppointment)
router.get('/getByPatient/:id',[adminAuth,getByPatientValidator],AppointmentControllers.getByPatient)
router.get('/viewPrescription',[adminAuth,prescriptionValidator],AppointmentControllers.viewPrescription)
router.post('/addNotes',[adminAuth,addNotesValidator],AppointmentControllers.addNotes)
router.get('/generatePdf',[generatePrescriptionValidator],AppointmentControllers.generatePrescriptionPDF)
router.post('/sendPrescription/:appointmentID',[adminAuth, sendPrescriptionValidator],AppointmentControllers.sendPrescription)
router.get('/getSingleAppointment',[adminAuth,singleAppointmentValidator],AppointmentControllers.getSingleAppointment)
router.patch('/completeAppointment/:id',[adminAuth,completeAppointmentValidator],AppointmentControllers.completeAppointment)




export default router