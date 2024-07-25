import AppointmentService from '../services/appointmentServices.js'

const AppoinmtentServices = new AppointmentService()


export default class AppointmentController {
    constructor() { }

    appoinmentList = async (req, res, next) => {
        try {
            const { status, date, search, pageSize, pageIndex } = req.query
            const { hospitalId } = req.body
            const allAppoinments = await AppoinmtentServices.getAllAppointments(status, date, search, pageSize, pageIndex, hospitalId)
            return res.status(201).json({ msg: 'Appointment Fetched Succesfully', allAppoinments });
        } catch (error) {
            next(error);
        }
    }

    scheduleAppointment = async (req, res, next) => {
        try {
            const { hospitalId, date, departmentId, patientId, doctorId, time } = req.body
            const appointmentData = await AppoinmtentServices.scheduleAppointment({ hospitalId, date, time, departmentId, patientId, doctorId })
            return res.status(201).json({ msg: 'Appointment Scheduled Succesfully', appointmentData });
        } catch (error) {
            next(error);
        }
    }

    rescheduleAppointment = async (req, res, next) => {
        try {
            const appointmentId = req.params.id
            const { date, time, userId } = req.body
            const appointmentData = await AppoinmtentServices.rescheduleAppointment(appointmentId, date, time, userId)
            return res.status(201).json({ msg: 'Appointment Rescheduled Succesfully', appointmentData });
        } catch (error) {
            next(error);
        }
    }

    addPrescription = async (req, res, next) => {
        try {
            const { appointmentId, vitals,advice,testPrescribed,diagnosis,medicines, userId } = req.body
            const prescriptions = await AppoinmtentServices.addPrescription({ appointmentId, vitals,advice,testPrescribed,diagnosis,medicines, userId })
            return res.status(201).json({ msg: 'Prescription Added Succesfully', prescriptions });
        } catch (error) {
            next(error)
        }
    }

    getByPatient = async (req, res, next) => {
        try {
            const patientId = req.params.id
            const { hospitalId } = req.body
            const appointmentData = await AppoinmtentServices.getByPatient(patientId, hospitalId)
            return res.status(201).json({ msg: 'Appointment Fetched Succesfully', appointmentData });
        } catch (error) {
            next(error)
        }
    }

    cancelAppointment = async (req, res, next) => {
        try {
            const appointmentId = req.params.id
            const appointmentData = await AppoinmtentServices.cancelAppointment(appointmentId)
            return res.status(201).json({ msg: 'Appointment Cancelled Successfully', appointmentData });
        } catch (error) {
            next(error)
        }
    }

    completeAppointment = async (req, res, next) => {
        try {
            const appointmentId = req.params.id
            const appointmentData = await AppoinmtentServices.completeAppointment(appointmentId)
            return res.status(201).json({ msg: 'Appointment Completed Successfully', appointmentData });
        } catch (error) {
            next(error)
        }
    }

    viewPrescription = async (req, res, next) => {
        try {
            const appointmentId = req.query.id
            const { hospitalId } = req.body
            const appointmentData = await AppoinmtentServices.viewPrescription(appointmentId, hospitalId)
            return res.status(201).json({ msg: 'Prescription Fetched Successfully', appointmentData });
        } catch (error) {
            next(error)
        }
    }

    addNotes = async (req, res, next) => {
        try {
            const { note, patientId } = req.body
            const appointmentData = await AppoinmtentServices.addNotes({ note, patientId })
            return res.status(201).json({ msg: 'Notes Added Successfully', appointmentData });
        } catch (error) {
            next(error)
        }
    }

    generatePrescriptionPDF = async (req, res, next) => {
        try {
            const { appointmentID } = req.query
            const appointmentData = await AppoinmtentServices.generatePrescriptionPDF( appointmentID )
            return res.status(201).json({ msg: 'Prescription Generated Successfully', appointmentData });
        } catch (error) {
            next(error)
        }
    }

    sendPrescription = async (req, res, next) => {
        try {
            const { appointmentID } = req.params
            const confirmation = await AppoinmtentServices.sendPrescription( appointmentID )
            return res.status(200).json({ msg: 'Prescription sent Successfully', data:confirmation });
        } catch (error) {
            next(error)
        }
    }

    getSingleAppointment = async (req, res, next) => {
        try {
            const { appointmentId } = req.query
            const confirmation = await AppoinmtentServices.getSingleAppointment(appointmentId )
            return res.status(200).json({ msg: 'Prescription fetched Successfully', data:confirmation });
        } catch (error) {
            next(error)
        }
    }


}

