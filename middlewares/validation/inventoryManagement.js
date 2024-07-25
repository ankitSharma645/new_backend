import { check } from "express-validator"
import { resultChecker } from "./resultChecker.js"


const addStockField=[
    check('medicineId',"Please provide medicine id").exists(),
    check('batchNumber','Please provide batch number').exists(),
    check('quantity','Please provide quantity').exists(),
    check('mfgDate','Please provide Mfg date').exists(),
    check('expDate','Please provide Exp number').exists()
]


export const addStockValidation=[addStockField,resultChecker]