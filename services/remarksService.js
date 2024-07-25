import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import Remark from '../models/remarkModel.js';

export default class RemarkService {
    constructor() { }

    async addRemarks(hospitalId, remarks, type) {
        try {

            const isRemarksAlreadyAdded = await Remark.aggregate()
                .match({
                    $expr: {
                        $or: [
                            { $eq: [{ $toLower: '$medicineName' }, remarks.toLowerCase()] }
                        ]
                    }
                })

            if (isRemarksAlreadyAdded.length > 0) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_REQUEST, true, 'Remark is already added.')
            }

            const remarkObject = {}
            remarkObject.remark = remarks
            remarkObject.hospitalId = hospitalId
            if (type) {
                remarkObject.type = type
            }

            const remark = await Remark.create(remarkObject)
            await remark.save()

            return remark

        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async getAllRemarks(hospitalId, type) {
        try {
            
            const matchCondition = {
                hospitalId: hospitalId,
                isActive: true
            }

            if(type){
                matchCondition.type = type
            }

            const remarks = await Remark.aggregate()
                .match(matchCondition)

            return remarks
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }
}