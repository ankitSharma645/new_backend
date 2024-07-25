import MedicieServices from "../services/medicineServices.js"

const medicineService = new MedicieServices()

export default class MedicineController {
    constructor() { }

    async addMedicine(req, res, next) {
        try {

            const result = await medicineService.addMedicine(req.body)

            return res.status(200).json({ msg: 'Success', data: result })
        } catch (error) {
            next(error)
        }
    }

    async getMedicine(req, res, next) {
        try {

            const { query, sortBy, sortType } = req.query

            const result = await medicineService.getMedicineDetails(req.body.hospitalId, query, sortBy, sortType)

            return res.status(200).json({ msg: 'Success', count: result.length, data: result })
        } catch (error) {
            next(error)
        }
    }
}