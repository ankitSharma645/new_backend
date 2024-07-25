import LabtestService from "../services/labtestService.js";

const labtestService = new LabtestService();

export default class LabtestController {
    constructor() { }

    async getLabtests(req, res, next) {
        try {

            const result = await labtestService.getAllLabtest(req.body.hospitalId)

            return res.status(200).json({ msg: 'Success', count: result.length, data: result })
        } catch (error) {
            next(error)
        }
    }
}