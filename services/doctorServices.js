import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import Doctors from '../models/doctorModel.js'
import Appointment from '../models/appointmentModel.js';
import appointmentService from './appointmentServices.js'

const AppointmentService = new appointmentService()

export default class DoctorServices {
    constructor() { }

    async getAllDoctors(hospitalId) {
        try {
            const doctorsList = await Doctors.find({ hospitalId })
            return doctorsList
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async getAllAppointments(doctorId, date ,hospitalId) {
        try {
            const startDate = date
            const endDate = +date + 86400000
            const totalAppointments = await Appointment.countDocuments({ doctorId, hospitalId,status: "Scheduled", date: { $gt: startDate, $lt: endDate } })
            return totalAppointments
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async changeAppointmentStatus(doctorId, status, date, rescheduleDate,userId,hospitalId) {
        try {

            const startDate = date
            const endDate = +date + 86400000
            const appointmentList = await Appointment.find({ doctorId,hospitalId, status: "Scheduled", date: { $gt: startDate, $lt: endDate } })
            if (appointmentList.length==0) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No appointment found')
            }

            let updatedAppointment
            if (status == "Cancel") {


                const statusHistory = {
                    status: "Cancelled",
                    date: new Date().getTime()
                }

                updatedAppointment = await Appointment.updateMany({ doctorId, hospitalId,status: "Scheduled", date: { $gt: startDate, $lt: endDate } },
                    {
                        $set: { status: "Cancelled" },
                        $push: { statusHistory: { $each: [statusHistory], $position: 0 } }
                    }
                )
                for (let x of appointmentList) {
                    AppointmentService.sendAppointmentMsg('appointment_cancel', x)
                }
            } else if (status = "Reschedule") {

                // const rescheduleStartDate = rescheduleDate
                // const rescheduleEndDate = +rescheduleDate + 86400000
                // const existingAppointment = await Appointment.find({ doctorId,hospitalId, status: "Scheduled", date: { $gt: rescheduleStartDate, $lt: rescheduleEndDate } })
                // if (existingAppointment.length>0) {
                //     throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'Appointment is already scheduled for the specified date.')
                // }
                for (let x of appointmentList) {

                    const newDate = new Date(rescheduleDate);

                    const prevDate = new Date(x.date);
                    const hours = prevDate.getHours();
                    const minutes = prevDate.getMinutes();
                    const seconds = prevDate.getSeconds();

                    newDate.setHours(hours, minutes, seconds);

                    const appointmentDataHistory = {
                        from: x.date,
                        to: newDate,
                        updatedBy: userId
                    }

                    const rescheduleAppointment = await Appointment.findByIdAndUpdate({_id:x._id},
                        { $set: { date: newDate }, $push: { rescheduleHistory: { $each: [appointmentDataHistory], $position: 0 } } }, { new: true })
                    AppointmentService.sendAppointmentMsg('appointment_reschedule', rescheduleAppointment)
                }
            }
            return updatedAppointment

        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }
}