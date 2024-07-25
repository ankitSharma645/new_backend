import express from 'express';
import { adminAuth } from '../middlewares/validation/auth.js';
import hospital from '../controllers/hospitalController.js';

const router = express.Router();

const HospitalController = new hospital();

router.post('/onboardHospital', [adminAuth], HospitalController.onboardHospital);
//router.get('/getHospitals', [adminAuth], hospitalController.getHospitals);

export default router;
