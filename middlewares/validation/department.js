import { check } from "express-validator";
import { resultChecker } from "./resultChecker.js";

const getAllDepartment = [
    check('hospitalId').exists().withMessage('HospitalId not found').isMongoId().withMessage('Invalid HospitalId'),

];

export const getDepartmentValidation = [getAllDepartment, resultChecker];
