import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required: true,
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hospitals',
        required: true,
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'departments',
        required: true,
    },
    date: {
        type: Number,
        required: true,
    },
    ailemnt: { type: String },
    status: {
        type: String,
        enum: ['Scheduled', 'Cancelled', 'Completed'],
        default: 'Scheduled',
    },
    prescription: {
        vitals: {
            pulseRate: { type: String },
            bodyWeight: { type: String },
            bodyTemperature: { type: String },
            bloodPressure: { type: String },
            SpO2: { type: String }
        },
        testPrescribed: [{ testId: { type: String }, testName: { type: String } }],
        advice: { type: String },
        diagnosis: { type: String },
        medicines: [{
            medicineId: { type: String },
            name: { type: String },
            period: { type: String },
            frequency: { type: String },
            remarks: { type: String }
        }],
        createdBy: { type: mongoose.Schema.Types.ObjectId },
        createdAt: { type: String }
    },
    prescriptionPdfUrl: { type: String },
    prescriptionPdfHistory: [{ url:{type: String },createdAt: { type: Date, default: Date.now }}],
    medicines: [],
    weight: {
        type: String
    },
    bloodPressure: {
        type: String
    },
    rescheduleHistory: [{
        from: Number,
        to: Number,
        updatedBy: mongoose.Schema.Types.ObjectId,
    }],
    prescriptionHistory: [{
        prescription: String,
        updatedBy: mongoose.Schema.Types.ObjectId,
        updatedDate: Number
    }],
    statusHistory: [{
        status: String,
        date: Number
    }]

}, { timestamps: true });

const Appointment = mongoose.model('appointment', appointmentSchema);

export default Appointment;
