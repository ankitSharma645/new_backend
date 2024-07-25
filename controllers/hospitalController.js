import hospitalServices from "../services/hospitalServices.js";

export default class HospitalController {
    constructor() {}

    async onboardHospital(req, res, next) {
        try {
            const hospitalData = req.body;
            const result = await hospitalServices.onboardHospital(hospitalData);
            return res.status(201).json({ msg: 'Hospital onboarded successfully', result });
        } catch (error) {
            next(error);
        }
    }

   /* async getHospitals(req, res, next) {
        try {
            const result = await hospitalService.getHospitals();
            return res.status(200).json({ msg: 'Hospitals fetched successfully', hospitals: result });
        } catch (error) {
            next(error);
        }
    }*/
   
}
