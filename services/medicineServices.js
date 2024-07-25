import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import Medicine from '../models/medicineModel.js'

export default class MedicieServices {
    constructor() { }

    async addMedicine(data) {
        try {

            const isMedicineAlreadyAdded = await Medicine.aggregate()
                .match({
                    $expr: {
                        $or: [
                          { $eq: [ { $toLower: '$medicineName' }, data.medicineName.toLowerCase() ] },
                        //   { $eq: [ { $toLower: '$genericName' }, data.genericName.toLowerCase() ] }
                        ]
                      }
                })

            if (isMedicineAlreadyAdded.length > 0) {
                throw new APIError('BAD_INPUT', HttpStatusCode.BAD_REQUEST, true, 'Medicine Name is already added.')
            }

            const medicineObj = {}
            medicineObj.medicineName = data.medicineName
            medicineObj.genericName = data.genericName
            medicineObj.manufacturedBy = data.manufacturedBy
            medicineObj.hospitalId = data.hospitalId

            const medicine = await Medicine.create(medicineObj)
            await medicine.save()

            return medicine
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async getMedicineDetails(hospitalId, query, sortBy='createdAt', sortType=1){
        try {

            const matchCondition = {
                hospitalId:hospitalId,
                isActive:true
            }

            if(query){
                matchCondition.$expr = {
                    $or: [
                        { $regexMatch: { input: "$medicineName", regex: query } },
                        { $regexMatch: { input: "$genericName", regex: query } }
                      ]
                }
            }

            const sortQuery = {}
            sortQuery[sortBy] = Number(sortType)

            const medicines = await Medicine.aggregate()
            .match(matchCondition)
            .sort({...sortQuery})

            return medicines
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async udpateStock(medicineId, type, quantity){
        try {
            
            const medicineDetails = await Medicine.findOne({_id: medicineId}).lean()
          
            if(!medicineDetails){
                throw new Error('Invalid Medicine Id')
            }

            const prevQuantity = medicineDetails.quantity
            let newQuantity = prevQuantity

            switch(type){
                case 'INC':
                newQuantity = newQuantity + quantity
                break;
               case  'DEC':
                newQuantity = newQuantity - quantity
                break;

            }

            await Medicine.findOneAndUpdate({_id:medicineId}, {$set:{quantity:newQuantity}})
            
            return true
        } catch (error) {
           return false
        }
    }

}