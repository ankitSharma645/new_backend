import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import Departments from '../models/departmentModel.js'

export default class DepartmentServices {
    constructor() { }

    async getAllDepartment(hospitalId){
        try {
            const departmentList=await Departments.find({hospitalId})
            return departmentList
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }
}