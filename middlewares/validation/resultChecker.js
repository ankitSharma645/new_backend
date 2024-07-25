import { validationResult } from "express-validator";
import APIError, { HttpStatusCode } from "../../exceptions/errorHandler.js"

export const resultChecker = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new APIError("BAD_INPUT", HttpStatusCode.BAD_INPUT, true, errors.array()[0].msg);
        }
        next()
    } catch (error) {
        next(error)
    }
};