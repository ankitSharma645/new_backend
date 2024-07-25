import Hospital from '../models/hospitalModel.js';

class HospitalServices {
    constructor() {}

    async onboardHospital(data) {
        const { name, code, address, contactNumber, email, logo } = data;

        try {
            // Check if hospital already exists
            const existingHospital = await Hospital.findOne({ code });
            if (existingHospital) {
                throw new Error("Hospital with this code already exists");
            }

            // Create a new hospital
            const hospital = new Hospital({
                name,
                code,
                address,
                contactNumber,
                email,
                logo,
            });

            await hospital.save();
            return hospital;
        } catch (error) {
            // Handle specific error scenarios
            if (error.message.includes("Hospital with this code already exists")) {
                throw new Error(error.message);
            } else {
                // Log the error and throw a generic error message
                console.error("Error onboarding hospital:", error);
                throw new Error("An error occurred while onboarding the hospital. Please try again.");
            }
        }
    }
/*
    async getHospitals() {
        try {
            const hospitals = await Hospital.find({});
            return hospitals;
        } catch (error) {
            throw new Error(`Error fetching hospitals: ${error.message}`);
        }
    }*/
}

export default new HospitalServices();
