import { AisensyConfig } from '../config/aisensy.js';
import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import { FormatDate } from '../helpers/dateFormat.js';
import Appointment from '../models/appointmentModel.js'
import Hospital from '../models/hospitalModel.js'
import mongoose from "mongoose"
import Patient from '../models/patientsModel.js'
import { PDFGenerate } from '../config/pdfGenerate.js';
import fs from 'fs'
import S3Service from './s3Service.js';
import FileHelper from '../helpers/fileHelper.js';


const SendMsg = new AisensyConfig()
const DateFormat = new FormatDate()
const GeneratePDF = new PDFGenerate()
const s3Service = new S3Service()

export default class AppointmentService {
    constructor() { }

    async getAllAppointments(status, date, search, pageSize, pageIndex, hospitalId) {
        try {

            let filterCount = {}
            const pipeline = []
            pipeline.push(
                {
                    $match: { hospitalId: hospitalId }
                },
                {
                    $lookup: { from: 'patients', localField: 'patientId', foreignField: '_id', as: 'patient' },
                },
                {
                    $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' },
                },
                {
                    $lookup: { from: 'hospitals', localField: 'hospitalId', foreignField: '_id', as: 'hospital' },

                },
                {
                    $lookup: { from: 'departments', localField: 'departmentId', foreignField: '_id', as: 'departments' },

                },
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        status: 1,
                        medicines: 1,
                        prescription: 1,
                        prescriptionPdfUrl: 1,
                        prescriptionHistory: 1,
                        prescriptionPdfHistory: 1,
                        'patient.name': 1,
                        'patient.phone': 1,
                        'patient._id': 1,
                        'patient.docs': 1,
                        'patient.dob': 1,
                        'patient.age': 1,
                        'patient.gender': 1,
                        'patient.reference': 1,
                        'patient.address': 1,
                        'patient.patientId': 1,
                        'patient.isActive': 1,
                        'patient.profilePic': 1,
                        'patient.thumbnail': 1,
                        'patient.appointmentNotes': 1,
                        'departments.name': 1,
                        'doctor.name': 1,
                        'doctor.mobile': 1,
                        'hospital.name': 1,
                    },
                },
            )
            if (search) {
                const regex = new RegExp(search, 'i');
                const searchQuery = {
                    $or: [
                        { 'patient.name': { $regex: regex } },
                        { 'doctor.name': { $regex: regex } },
                        { 'patient.patientId': { $regex: regex } },
                        { 'patient.phone': { $regex: regex } }
                    ],
                    $and: [
                        { 'patient.isActive': true }
                    ]
                }
                pipeline.push({
                    $match: searchQuery
                });
                filterCount = { ...searchQuery }
            }

            if (status) {
                pipeline.push({
                    $match: {
                        ...(status && { status })
                    },
                });
                filterCount = { ...filterCount, status }
            }

            if (date && !isNaN(date)) {
                pipeline.push({
                    $match: {
                        ...{
                            date: { $gte: Number(date), $lte: (Number(date) + 3600 * 24 * 1000) }
                        },
                    },
                });
                filterCount = { ...filterCount, date: { $gte: Number(date), $lte: (Number(date) + 3600 * 24 * 1000) } }
            }
            const countPipeline = [...pipeline]
            pipeline.push({
                $skip: ((pageIndex - 1) * pageSize) || 0
            },
                {
                    $limit: +pageSize || 25
                })
            const appointmentList = await Appointment.aggregate(pipeline)
            const count = await Appointment.aggregate(countPipeline)
            if (appointmentList) {
                return { count: count.length, appointmentList };
            }
        } catch (error) {
            console.log(error.name)
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async scheduleAppointment(body) {
        try {
            const formatedDate = await DateFormat.getTimestampFromYYYYMMDD(body.date) + await DateFormat.convertTimeStringToMilliseconds(body.time)
            let appointmentDate = new Date(formatedDate).setHours(0, 0, 0, 0)
            const existingAppointment = await Appointment.findOne({
                date: {
                    $gte: appointmentDate,
                    $lt: appointmentDate + (24 * 60 * 60 * 1000),
                },
                patientId: new mongoose.Types.ObjectId(body.patientId),
                doctorId: new mongoose.Types.ObjectId(body.doctorId),
                departmentId: new mongoose.Types.ObjectId(body.departmentId),
                status: { $nin: ['Cancelled'] },
            });
            if (existingAppointment) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'An appointment already exists on the specified date.')
            }
            const appointmentData = await Appointment.create({ ...body, date: formatedDate });
            await this.sendAppointmentMsg("robodoc_appointment", { ...body, date: formatedDate })
            if (appointmentData) {
                return appointmentData;
            }
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async rescheduleAppointment(appointmentId, date, time, userId) {
        try {
            const appointmentData = await Appointment.findOne({ _id: appointmentId })

            if (!appointmentData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'Appointment with provided id not found')
            }

            if (appointmentData.status == 'Completed') {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'This appointment is already completed. Cannot reschedule.')
            }

            const formatedDate = await DateFormat.getTimestampFromYYYYMMDD(date) + await DateFormat.convertTimeStringToMilliseconds(time)
            let appointmentDate = new Date(formatedDate).setHours(0, 0, 0, 0)
            const existingAppointment = await Appointment.findOne({
                date: {
                    $gte: appointmentDate,
                    $lt: appointmentDate + (24 * 60 * 60 * 1000),
                },
                patientId: appointmentData.patientId,
                doctorId: appointmentData.doctorId,
                departmentId: appointmentData.departmentId,
                status: { $nin: ['Cancelled'] },
                _id: { $ne: appointmentData._id }
            });
            if (existingAppointment) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'An appointment already exists on the specified date.')
            }

            const appointmentDataHistory = {
                from: appointmentData.date,
                to: formatedDate,
                updatedBy: userId
            }

            const rescheduleAppointment = await Appointment.findByIdAndUpdate(appointmentId,
                { $set: { date: formatedDate }, $push: { rescheduleHistory: { $each: [appointmentDataHistory], $position: 0 } } }, { new: true })

            await this.sendAppointmentMsg("appointment_reschedule", rescheduleAppointment)
            if (rescheduleAppointment) {
                return rescheduleAppointment;
            }
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async addPrescription({ appointmentId, vitals, advice, testPrescribed, diagnosis, medicines, userId }) {
        try {

            const appointmentData = await Appointment.findOne({ _id: appointmentId })

            if (!appointmentData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Appointment found')
            }
            const prescriptionObj = {
                vitals,
                advice,
                testPrescribed,
                diagnosis,
                medicines,
                createdBy: userId,
                createdAt: new Date().getTime()
            }

            const prescriptionData = await Appointment.findByIdAndUpdate(appointmentId,
                {
                    $set: { prescription: prescriptionObj, status: 'Completed' },
                }, { new: true })

            return prescriptionData
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async sendAppointmentMsg(campaignName, data) {

        const appointmentData = await Appointment.findOne({ patientId: data.patientId, date: data.date }).populate('patientId doctorId hospitalId')
        const { formattedDate, formattedTime } = await DateFormat.getDateTime(appointmentData.date)
        const msgContent = {
            campaignName,
            destination: appointmentData.patientId.phone,
            userName: appointmentData.patientId.name,
            templateParams: [
                appointmentData.patientId.name,//Patient Name
                appointmentData.hospitalId.name,//Destination
                formattedDate,//Date
                formattedTime,//Time
                appointmentData.doctorId.name//Doctor
            ]
        }
        const result = SendMsg.sendWhatappMsg(msgContent)

        return result
    }

    async sendCancellationMsg(campaignName, appointmentId) {
        try {
            const appointmentData = await Appointment.findOne({ _id: appointmentId }).populate('patientId doctorId hospitalId')
            const { formattedDate, formattedTime } = await DateFormat.getDateTime(appointmentData.date)
            const msgContent = {
                campaignName,
                destination: appointmentData.patientId.phone,
                userName: appointmentData.patientId.name,
                templateParams: [
                    appointmentData.patientId.name,//Patient Name
                    appointmentData.hospitalId.name,//Destination
                    appointmentData.doctorId.name,//Doctor
                    formattedDate,//Date
                    formattedTime//Time

                ]
            }
            const result = SendMsg.sendWhatappMsg(msgContent)

            return result
        } catch (error) {
            console.log(error)
        }
    }

    async getByPatient(id, hospitalId) {
        try {

            const appointmentList = await Appointment.find({ hospitalId: hospitalId, patientId: id }).populate('doctorId patientId doctorId departmentId')
            if (!appointmentList) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Appointment found')
            }
            return appointmentList;
        } catch (error) {
            console.log(error.name)
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async cancelAppointment(id) {
        try {

            const appointmentData = await Appointment.findOne({ _id: id })

            if (!appointmentData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Appointment found')
            }

            const statusHistory = {
                status: appointmentData.status,
                date: new Date().getTime()
            }

            const updatedAppointment = await Appointment.findByIdAndUpdate(id,
                {
                    $set: { status: "Cancelled" },
                    $push: { statusHistory: { $each: [statusHistory], $position: 0 } }
                }
            )

            this.sendCancellationMsg('appointment_cancel', id)

            return updatedAppointment;
        } catch (error) {
            console.log(error.name)
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async completeAppointment(id) {
        try {

            const appointmentData = await Appointment.findOne({ _id: id })

            if (!appointmentData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Appointment found')
            }

            const statusHistory = {
                status: 'Completed',
                date: new Date().getTime()
            }

            const updatedAppointment = await Appointment.findByIdAndUpdate(id,
                {
                    $set: { status: "Completed" },
                    $push: { statusHistory: { $each: [statusHistory], $position: 0 } }
                }
            )

            return updatedAppointment;
        } catch (error) {
            console.log(error.name)
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async viewPrescription(id, hospitalId) {
        try {

            const prescriptionData = await Appointment.findOne({ hospitalId: hospitalId, _id: id }, { prescriptionHistory: 1 }).populate({
                path: 'prescriptionHistory',
                populate: { path: 'updatedBy', model: 'admins', select: "name" }
            });
            const newresult = prescriptionData.prescriptionHistory.sort((a, b) => b.updatedDate - a.updatedDate);

            return newresult
        } catch (error) {
            console.log(error.name)
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async addNotes({ note, patientId }) {
        try {
            const patientData = await Patient.findOne({ _id: patientId })

            if (!patientData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Patient found')
            }

            const updatedPatient = await Patient.findOneAndUpdate(
                { _id: patientData._id },
                { $set: { appointmentNotes: note } },
                { new: true }
            );

            return updatedPatient;
        } catch (error) {
            console.log(error.name);
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async generatePrescriptionPDF(appoinmentID) {
        try {
            const appointmentData = await Appointment.findOne({ _id: appoinmentID }).populate('patientId doctorId hospitalId')
            const timestamp = new Date().getTime()

            if (!appointmentData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Appointment found')
            }

            const pdfData = {
                patientName: appointmentData.patientId.name,
                patientPhone: appointmentData.patientId.phone,
                patientGender: appointmentData.patientId.gender,
                date: await DateFormat.prescriptionPdfDate(appointmentData.prescription.createdAt),
                hospital:appointmentData.hospitalId,
                doctor:appointmentData.doctorId,
                ...appointmentData.prescription
            }

            const data = await GeneratePDF.renderEjs('templates/prescription/report.ejs', pdfData)
            const outputPath = `./upload/temp/${appointmentData._id + '-' + timestamp}.pdf`
            await GeneratePDF.convertHtmlToPdf(data, outputPath, "A4")

            const underScoredDateAndTime = DateFormat.getUnderscoredDateAndTime(new Date().getTime())
            const fileName = `${appointmentData.patientId.name}_${underScoredDateAndTime}.pdf`

            const s3path = `${appointmentData.hospitalId._id.toString()}/${appointmentData.patientId._id.toString()}/prescription/${fileName}`
            const fileContent = fs.readFileSync(outputPath)
            const pdfUrl = await s3Service.uploadFileToS3(process.env.BUCKET_NAME, s3path, fileContent, 'application/pdf')
            FileHelper.deleteFile(outputPath)

            const updatedData = await Appointment.findByIdAndUpdate({ _id: appointmentData._id }, {
                $set: { prescriptionPdfUrl: pdfUrl },
                $push: { prescriptionPdfHistory: { $each: [{ url: pdfUrl }], $position: 0 } }
            }, { new: true })


            return updatedData;
        } catch (error) {
            console.log(error.name);
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async sendPrescription(appoinmentID) {
        try {
            const appointmentData = await Appointment.findOne({ _id: appoinmentID }).populate('patientId hospitalId doctorId')

            if (!appointmentData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Appointment found')
            }

            if (!appointmentData.prescriptionPdfUrl) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'Prescription not generated yet.')
            }

            const underScoredDateAndTime = DateFormat.getUnderscoredDateAndTime(appointmentData.date)

            const fileName = `${appointmentData.patientId.name}_${underScoredDateAndTime}.pdf`

            const { formattedDate } = await DateFormat.getDateTime(appointmentData.date)
            const msgContent = {
                campaignName: 'prescription',
                destination: appointmentData.patientId.phone,
                userName: appointmentData.patientId.name,
                templateParams: [
                    appointmentData.patientId.name,//Patient Name
                    appointmentData.hospitalId.name,//hospital name
                    formattedDate, // appointment date
                    appointmentData.doctorId.mobile,//Doctor mobile
                    appointmentData.hospitalId.name,//hospital name
                    appointmentData.hospitalId.contactNumber//hospital contact number 

                ],
                media: {
                    url: appointmentData.prescriptionPdfUrl,
                    filename: fileName
                }
            }
            const result = await SendMsg.sendWhatappMsg(msgContent)
            return result.data
        } catch (error) {
            console.log(error);
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async getSingleAppointment(appoinmentID) {
        try {
            const appointmentData = await Appointment.findOne({ _id: appoinmentID }).populate('patientId hospitalId doctorId')

            if (!appointmentData) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Appointment found')
            }

            return appointmentData
        } catch (error) {
            console.log(error);
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }
}