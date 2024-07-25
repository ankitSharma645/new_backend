import { check } from "express-validator"
import { resultChecker } from "./resultChecker.js"

const validateMobile = (value,key="") => {
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(value)) {
    throw new Error(`Invalid ${key} number format`);
  }
  return true;
};

const addPatientField = [
  check('name', 'Name is required').exists(),
  check('phone', 'Phone is required').exists().custom((value)=>validateMobile(value,'patient contact')),
  check('gender').exists().withMessage("Gender is required").isIn(['MALE', 'FEMALE',"OTHER"]).withMessage("Invalid Gender"),
  // check('dob',"Date of birth is required").exists(),
];

const updatePatientField=[
  check('id').notEmpty().withMessage('Id is required to delete Patient').isMongoId().withMessage('Invalid Patient Id'),
]

const deletePatientField = [
  check('id').notEmpty().withMessage('Id is required to delete Patient').isMongoId().withMessage('Invalid Patient Id'),
];

const deleteDocField = [
  check('patientId').notEmpty().withMessage('PatientID is required to delete Docs').isMongoId().withMessage('Invalid Patient Id'),
  check('filePath').notEmpty().withMessage('File path is required to delete Docs')
];

const deleteMultipleDocField = [
  check('patientId').notEmpty().withMessage('PatientID is required to delete Docs').isMongoId().withMessage('Invalid Patient Id'),
  check('filePathArray').notEmpty().withMessage('File path Array is required to delete Docs')
];

const addUnverifiedPatientField = [
  check('name', 'Name is required').exists(),
  check('phone', 'Phone is required').exists().custom((value)=>validateMobile(value,'patient contact')),
  check('gender').exists().withMessage("Gender is required").isIn(['MALE', 'FEMALE',"OTHER"]).withMessage("Invalid Gender"),
  check('hospitalId').notEmpty().withMessage('HospitalId is required to add patients').isMongoId().withMessage('Invalid Hospital Id'),
];

export const addPatientValidators = [addPatientField, resultChecker]
export const updatePatientValidators=[updatePatientField,resultChecker]
export const deletePatientValidators=[deletePatientField,resultChecker]
export const deleteDocValidators=[deleteDocField,resultChecker]
export const deleteMultipleDocValidators=[deleteMultipleDocField,resultChecker]
export const unverifiedPatientValidator= [addUnverifiedPatientField, resultChecker]


