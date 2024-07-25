import DoctorService from "../services/doctorServices.js"

const DoctorServices = new DoctorService()
export default class DoctorController {
    constructor() { }

    async getAllDoctors(req,res,next){
        
        try {
            const {hospitalId}=req.body
            const result = await DoctorServices.getAllDoctors(hospitalId)
            return res.status(200).json({ msg: 'Data Fetched Successfully', doctors:result })

        } catch (error) {
            next(error)
        }
    }

    async getAllAppointment(req,res,next){
        
        try {
            const {doctorId,date}=req.query
            const {hospitalId} = req.body
            const totalAppointment = await DoctorServices.getAllAppointments(doctorId,date,hospitalId)
            return res.status(200).json({ msg: 'Appointment Count fetched Successfully', totalAppointment })

        } catch (error) {
            next(error)
        }
    }

    async changeAppointmentStatus(req,res,next){
        
        try {
            const {doctorId}=req.params
            const {status,date,rescheduleDate,userId,hospitalId}=req.body
            const totalAppointment = await DoctorServices.changeAppointmentStatus(doctorId,status,date,rescheduleDate,userId,hospitalId)
            return res.status(200).json({ msg: 'Appointments Updated Successfully' })

        } catch (error) {
            next(error)
        }
    }
    
}