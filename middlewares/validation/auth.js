import jwt from "jsonwebtoken"
import APIError, { HttpStatusCode } from "../../exceptions/errorHandler.js"
import mongoose from 'mongoose'
import { getObjectId } from "../../helpers/mongoose.js";

// Admin Authentication
export const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers['x-auth-token'];
        if (!token) {
            throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'Unauthorized Token');
        }
        let verify = null
        try {
            verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (error) {
            throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'Unauthorized Token');
        }

        if (new Date().getTime() > verify.tokenExpiryTime) {
            throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'Token has been expired. Kindly Relogin!');
        }

        const userId = getObjectId(verify.userId)
        const hospitalId = getObjectId(verify.hospitalId)
        const userRole = verify.userRole

        req.body.userId = userId
        req.body.hospitalId = hospitalId
        req.body.userRole = userRole
        next();
    } catch (error) {
        next(error)
    }
}
