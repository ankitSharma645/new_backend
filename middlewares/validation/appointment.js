import { check } from "express-validator"
import { resultChecker } from "./resultChecker.js"


const addAppointmentField = [
    check('patientId', "Please provide patient id").exists(),
    check('doctorId', "Please provide doctor id").exists(),
    check('departmentId', "Please provide department id").exists(),
    check('date', 'Please provide appointment date').exists(),
    check("time", 'Please provide appointment time').exists(),
]

const prescriptionField = [
    check('appointmentId', "Please provide appointment id").exists(),
    check('prescription', "Please provide prescription data").exists()
]

const rescheduleAppointmentField = [
    check('id').notEmpty().withMessage('Appointment id is required to reschedule appointment').isMongoId().withMessage('Invalid Appointment Id'),
    check('date', "Please provide appointment date").exists(),
    check('time', "Please provide appointment time").exists()
]

const getByPatientField = [
    check('id').notEmpty().withMessage('Patient id is required to get appointments').isMongoId().withMessage('Invalid Patient Id'),
]
const cancelAppointmentField = [
    check('id').notEmpty().withMessage('Appointment id is required to cancel appointments').isMongoId().withMessage('Invalid Appointment Id'),
]

const completeAppointmentField = [
    check('id').notEmpty().withMessage('Appointment id is required to complete appointment').isMongoId().withMessage('Invalid Appointment Id'),
]

const viewPrescriptionField = [
    check('id').notEmpty().withMessage('Appointment id is required to view prescription').isMongoId().withMessage('Invalid Appointment Id'),
]

const addNotesField = [
    check('patientId').notEmpty().withMessage('Patient id is required to add notes').isMongoId().withMessage('Invalid Appointment Id'),
    check('note').notEmpty().withMessage('Note is empty')
]

const generatePrescriptionPDF = [
    check('appointmentID').notEmpty().withMessage('Appointment id is required to genereate pdf').isMongoId().withMessage('Invalid Appointment Id'),
]

const sendPrescription = [
    check('appointmentID').notEmpty().withMessage('Appointment id is required to genereate pdf').isMongoId().withMessage('Invalid Appointment Id'),
]

const singleAppointment = [
    check('appointmentId').notEmpty().withMessage('Appointment id is required to genereate pdf').isMongoId().withMessage('Invalid Appointment Id'),
]



export const addAppointmentValidator = [addAppointmentField, resultChecker]
export const addPrescriptionValidator = [prescriptionField, resultChecker]
export const rescheduleAppointmentValidator = [rescheduleAppointmentField, resultChecker]
export const getByPatientValidator = [getByPatientField, resultChecker]
export const cancelAppointmentValidator = [cancelAppointmentField, resultChecker]
export const completeAppointmentValidator = [completeAppointmentField, resultChecker]
export const prescriptionValidator = [viewPrescriptionField, resultChecker]
export const addNotesValidator = [addNotesField, resultChecker]
export const generatePrescriptionValidator = [generatePrescriptionPDF, resultChecker]
export const sendPrescriptionValidator = [sendPrescription, resultChecker]
export const singleAppointmentValidator = [singleAppointment, resultChecker]







