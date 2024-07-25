import DepartmentService from "../services/departmentServices.js"

const DepartmentServices = new DepartmentService()
export default class DepartmentController {
    constructor() { }

    async getAllDepartment(req,res,next){
        
        try {
            const {hospitalId}=req.body
            const result = await DepartmentServices.getAllDepartment(hospitalId)
            return res.status(200).json({ msg: 'Data Fetched Successfully', departments:result })

        } catch (error) {
            next(error)
        }
    }
}