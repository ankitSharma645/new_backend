import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import Labtest from '../models/labtestModel.js';

export default class LabtestService {
    constructor() { }

    async getAllLabtest(hospitalId) {
        try {
            const matchCondition = {
                hospitalId: hospitalId,
                isActive: true
            }

            const labtests = await Labtest.aggregate()
                .match(matchCondition)

            return labtests
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }
}