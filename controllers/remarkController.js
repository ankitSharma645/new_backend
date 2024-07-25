import RemarkService from "../services/remarksService.js"

const remarkService = new RemarkService();

export default class RemarkController {
    constructor() { }

    async addRemark(req, res, next) {
        try {

            const { remark, type, hospitalId } = req.body

            const result = await remarkService.addRemarks(hospitalId, remark, type)

            return res.status(200).json({ msg: 'Success', data: result })
        } catch (error) {
            next(error)
        }
    }

    async getRemarks(req, res, next) {
        try {

            const { type } = req.query

            const result = await remarkService.getAllRemarks(req.body.hospitalId, type)

            return res.status(200).json({ msg: 'Success', count: result.length, data: result })
        } catch (error) {
            next(error)
        }
    }
}