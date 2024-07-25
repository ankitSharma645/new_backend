import { check ,body} from "express-validator";
import { resultChecker } from "./resultChecker.js";

const getDoctorField = [
    check('hospitalId').exists().withMessage('HospitalId not found').isMongoId().withMessage('Invalid HospitalId'),
];

const getAppointmentField = [
    check('doctorId').exists().withMessage('DoctorId not found').isMongoId().withMessage('Invalid DoctorId'),
];

const changeAppointmentStatusField = [
    check('doctorId').exists().withMessage('DoctorId not found').isMongoId().withMessage('Invalid DoctorId'),
    check('status').exists().withMessage('Status not found'),
    check('date').exists().withMessage('Date not found'),
    body('status').custom((value, { req }) => {
        if (value === 'reschedule' && !req.body.rescheduleDate) {
            throw new Error('Date is required');
        }
        return true; 
    }),
];





export const getDoctorValidation = [getDoctorField, resultChecker];
export const getAppointmentValidation = [getAppointmentField, resultChecker];
export const changeAppointmentStatusValidation = [changeAppointmentStatusField, resultChecker];




