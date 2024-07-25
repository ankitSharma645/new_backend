import Patient from "../services/patientServices.js";

const patientServices = new Patient()

export default class patientController {
    constructor() { }

    async addPatient(req, res, next) {
        try {
            const { name, phone, dob, profilePic, emergencyContactName, emergencyContactNumber, email, govtID, address, gender, hospitalId, reference } = req.body;
            const newPatient = await patientServices.addNewPatient({ name, phone, dob, profilePic, emergencyContactName, emergencyContactNumber, email, govtID, address, gender, hospitalId, reference });
            return res.status(201).json({ msg: 'Patient Added Succesfully', newPatient });
        } catch (error) {
            next(error);
        }
    };

    async getPatient(req, res, next) {
        try {

            const { query, pageIndex, pageSize } = req.query
            const { hospitalId } = req.body

            const allPatients = await patientServices.getAllPatient(query, pageIndex, pageSize, hospitalId);
            return res.status(201).json({ msg: 'Patient Fetched Succesfully', allPatients });
        } catch (error) {
            next(error);
        }
    };

    async updatePatient(req, res, next) {
        try {
            const patientID = req.params.id
            const { name, phone, dob, profilePic, emergencyContactName, emergencyContactNumber, email, govtID, address, gender, hospitalId, reference } = req.body;
            const updatedPatient = await patientServices.updatePatient(patientID, { name, phone, dob, profilePic, emergencyContactName, emergencyContactNumber, email, govtID, address, gender, hospitalId, reference });
            return res.status(201).json({ msg: 'Patient Updated Succesfully', updatedPatient });
        } catch (error) {
            next(error);
        }
    };

    async deletePatient(req, res, next) {
        try {
            const patientID = req.params.id
            const deletedPatient = await patientServices.deletePatient(patientID);
            return res.status(201).json({ msg: 'Patient Deleted Succesfully', deletedPatient });
        } catch (error) {
            next(error);
        }
    };
    async uploadPatientDocuments(req, res, next) {
        try {
            const { patientId } = req.params
            const result = await patientServices.uploadPatientDocuments(patientId, req.body.hospitalId, req.body.userId, req.body.customfilename, req.file)
            return res.status(200).json({ msg: 'Success', data: result })
        } catch (error) {
            next(error);
        }
    }

    async deleteDoc(req, res, next) {
        try {
            const { patientId, filePath, hospitalId } = req.body
            await patientServices.deleteDocs(patientId, filePath, hospitalId)
            return res.status(200).json({ msg: 'Success', msg: "Document Deleted Successfully" })
        } catch (error) {
            next(error);
        }
    }

    async deleteMultipleDoc(req, res, next) {
        try {
            const { patientId, filePathArray, hospitalId } = req.body
            const result = await patientServices.deleteMultipleDocs(patientId, filePathArray, hospitalId)
            return res.status(200).json({ msg: 'Success', data: result })
        } catch (error) {
            next(error);
        }
    }

    async addUnverifiedPatient(req, res, next) {
        try {
            const { name, phone, dob, age, profilePic, emergencyContactName, emergencyContactNumber, email, govtID, address, gender, hospitalId, reference } = req.body;
            const newPatient = await patientServices.addUnverifiedPatient({ name, phone, dob, age, profilePic, emergencyContactName, emergencyContactNumber, email, govtID, address, gender, hospitalId, reference });
            return res.status(201).json({ msg: 'Patient Added Succesfully', newPatient });
        } catch (error) {
            next(error);
        }
    };

}