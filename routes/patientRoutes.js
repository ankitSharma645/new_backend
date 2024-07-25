import express from 'express'
import { addPatientValidators, deleteDocValidators, deleteMultipleDocValidators, deletePatientValidators, unverifiedPatientValidator, updatePatientValidators } from '../middlewares/validation/patient.js'
import patient from '../controllers/patientController.js'
import { adminAuth } from '../middlewares/validation/auth.js'
import MulterServices from '../services/multer.js'

const router = express.Router()
const patientController=new patient()
const multerService = new MulterServices()

router.get('/getAllPatients',[adminAuth],patientController.getPatient)
router.post('/addPatient',[addPatientValidators,adminAuth], patientController.addPatient)
router.patch('/updatePatient/:id',[updatePatientValidators,adminAuth],patientController.updatePatient)
router.patch('/deletePatient/:id',[deletePatientValidators,adminAuth],patientController.deletePatient)
router.post('/uploadDocument/:patientId',[adminAuth],(req, res, next)=>{
    try {
       const requestBody = req.body
        multerService.uploadToMulter('./upload/temp',['pdf', 'png', 'jpeg', 'jpg']).single('patientfile')(req, res, (err)=>{
            if(req.fileValidationError || err){
                return res.status(400).json({ error: { message: err?.message || req.fileValidationError || "File upload failed", isOperational: true, httpCode: 400 } });
            }
            req.body = {...requestBody,...req.body}
            patientController.uploadPatientDocuments(req,res, next)
        })
    } catch (error) {
        console.log(error)
    }
})
router.post('/deleteDoc',[deleteDocValidators , adminAuth],patientController.deleteDoc)
router.post('/deleteMultipleDocs',[deleteMultipleDocValidators , adminAuth],patientController.deleteMultipleDoc)
router.post('/addUnverifiedPatient',[unverifiedPatientValidator], patientController.addUnverifiedPatient)

export default router