import mongoose from 'mongoose';
import APIError, { HttpStatusCode } from '../exceptions/errorHandler.js';
import Patient from '../models/patientsModel.js'
import S3Service from './s3Service.js';
import fs from 'fs'
import FileHelper from '../helpers/fileHelper.js';
import Hospital from '../models/hospitalModel.js';
import Counter from '../models/counterModel.js';
import { FormatDate } from '../helpers/dateFormat.js';
import Base64ToImage from '../helpers/base64ToImage.js';
import { ImageResizer } from '../helpers/fileResize.js';

const s3Service = new S3Service()
const DateFormat = new FormatDate()
const base64ToImage = new Base64ToImage();
const imageResizer = new ImageResizer()
export default class PatientServices {
  constructor() { }

  async addNewPatient(body) {
    try {
      const patientId = await this.generatePatientId(body.hospitalId)
      body.patientId = patientId
      body.dob = await DateFormat.getTimestampFromYYYYMMDD(body.dob)
      body.isVerified = true
      const timeStamp = new Date().getTime()
      if (body.profilePic) {
        const s3path = `${body.hospitalId.toString()}/${patientId.toString()}/${body.name}`
        const s3pathThumbnail = `${body.hospitalId.toString()}/${patientId.toString()}/thumbnail-${body.name}`
        base64ToImage.convert(body.profilePic, `upload/temp/${timeStamp}.png`);
        const fileContent = fs.readFileSync(`upload/temp/${timeStamp}.png`)
        const result = await s3Service.uploadFileToS3(process.env.BUCKET_NAME, s3path, fileContent, 'image/png')
        body.profilePic = result

        //thumnbnail
        await imageResizer.resizeImage(fileContent, `upload/temp/thumbnail-${timeStamp}.png`, 50, 50);

        const resizedImagePath = fs.readFileSync(`upload/temp/thumbnail-${timeStamp}.png`)
        const thumbnailUrl = await s3Service.uploadFileToS3(process.env.BUCKET_NAME, s3pathThumbnail, resizedImagePath, 'image/png');

        body.thumbnail = thumbnailUrl;
        FileHelper.deleteFile(`upload/temp/${timeStamp}.png`)
        FileHelper.deleteFile(`upload/temp/thumbnail-${timeStamp}.png`)
      }
      const newPatient = await Patient.create(body);

      if (newPatient) {
        return newPatient;
      }
    } catch (error) {
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async generatePatientId(hospitalId) {
    try {

      const hospitalDetails = await Hospital.findOne({ _id: hospitalId }).select('code')
      const counterDetails = await Counter.findOne({ hospitalId: hospitalId }).select('patientIdCounter')

      let counter = counterDetails ? counterDetails.patientIdCounter : 0

      const todayDateObj = new Date()

      let dd = todayDateObj.getDate().toString()
      let mm = (todayDateObj.getMonth() + 1).toString()
      let yy = todayDateObj.getFullYear().toString()

      if (dd < 10) {
        dd = '0' + dd
      }

      if (mm < 10) {
        mm = '0' + mm
      }

      if (yy < 10) {
        yy = '0' + yy
      }

      counter++

      if (counter < 10) {
        counter = '00' + counter
      }

      if (counter < 100 && counter > 10) {
        counter = '0' + counter
      }

      let id = `${hospitalDetails.code}${dd}${mm}${yy}${counter}`


      await Counter.findOneAndUpdate({ hospitalId: hospitalId }, { $set: { patientIdCounter: counter } }, { new: true })

      return id

    } catch (error) {
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async getAllPatient(query, pageIndex, pageSize, hospitalId) {
    try {
      if (pageIndex) {
        pageIndex = parseInt(pageIndex)
      }
      if (pageSize) {
        pageSize = parseInt(pageSize)
      }
      if (query) {
        const patients = await this.searchPatient(query, pageSize, pageIndex, hospitalId)
        return patients;
      }

      const patients = await Patient.aggregate([
        { $match: { hospitalId: hospitalId, isActive: true } },
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'patientId',
            as: 'appointments'
          }
        },
        {
          $addFields: {
            uniqueDepartmentIds: {
              $map: {
                input: {
                  $reduce: {
                    input: '$appointments',
                    initialValue: [],
                    in: {
                      $cond: {
                        if: { $in: ['$$this.departmentId', '$$value'] },
                        then: '$$value',
                        else: { $concatArrays: ['$$value', ['$$this.departmentId']] }
                      }
                    }
                  }
                },
                as: 'deptId',
                in: '$$deptId'
              }
            }
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'uniqueDepartmentIds',
            foreignField: '_id',
            as: 'departments'
          }
        },
        {
          $project: {
            appointments: 0,           // Exclude the appointments field
            uniqueDepartmentIds: 0,    // Exclude the uniqueDepartmentIds field
            departments: {
              hospitalId: 0,
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: ((pageIndex - 1) * (pageSize || 25) || 0) },
        { $limit: pageSize || 25 }
      ]);



      // const patients = await Patient.find({hospitalId:hospitalId,isActive:true}).sort({ createdAt: -1 }).limit(pageSize || 25)
      // .skip(((pageIndex - 1) * pageSize) || 0)
      const count = await Patient.countDocuments({ hospitalId: hospitalId, isActive: true });

      return { count, patients };
    } catch (error) {
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async updatePatient(id, body) {
    try {
      const patientData = await Patient.findOne({ _id: id })
      body.dob = await DateFormat.getTimestampFromYYYYMMDD(body.dob)
      const timeStamp = new Date().getTime()
      if (body.profilePic) {
        const s3path = `${body.hospitalId.toString()}/${id.toString()}/${body.name}`
        const s3pathThumbnail = `${body.hospitalId.toString()}/${id.toString()}/thumbnail-${body.name}`
        if (patientData.profilePic) {
          s3Service.deleteObjectFromBucket(process.env.BUCKET_NAME, s3path)
          s3Service.deleteObjectFromBucket(process.env.BUCKET_NAME, s3pathThumbnail)
        }
        base64ToImage.convert(body.profilePic, `upload/temp/${timeStamp}.png`);
        const fileContent = fs.readFileSync(`upload/temp/${timeStamp}.png`)
        const result = await s3Service.uploadFileToS3(process.env.BUCKET_NAME, s3path, fileContent, 'image/png')
        body.profilePic = result

        //thumnbnail
        await imageResizer.resizeImage(fileContent, `upload/temp/thumbnail-${timeStamp}.png`, 50, 50);

        const resizedImagePath = fs.readFileSync(`upload/temp/thumbnail-${timeStamp}.png`)
        const thumbnailUrl = await s3Service.uploadFileToS3(process.env.BUCKET_NAME, s3pathThumbnail, resizedImagePath, 'image/png');

        body.thumbnail = thumbnailUrl;
        FileHelper.deleteFile(`upload/temp/${timeStamp}.png`)
        FileHelper.deleteFile(`upload/temp/thumbnail-${timeStamp}.png`)
      }
      const patients = await Patient.findByIdAndUpdate(id, body, { new: true });

      if (patients) {
        return patients;
      }
    } catch (error) {
      console.log(error)
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async searchPatient(query, pageSize, pageIndex, hospitalId) {
    try {

      const patients = await Patient.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { name: { $regex: query, $options: 'i' } },
                  { phone: { $regex: query, $options: 'i' } },
                  { email: { $regex: query, $options: 'i' } },
                  { patientId: { $regex: query, $options: 'i' } },
                ],
              },
              { isActive: true },
              { hospitalId: hospitalId }
            ]
          }
        },
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'patientId',
            as: 'appointments'
          }
        },
        {
          $addFields: {
            uniqueDepartmentIds: {
              $map: {
                input: {
                  $reduce: {
                    input: '$appointments',
                    initialValue: [],
                    in: {
                      $cond: {
                        if: { $in: ['$$this.departmentId', '$$value'] },
                        then: '$$value',
                        else: { $concatArrays: ['$$value', ['$$this.departmentId']] }
                      }
                    }
                  }
                },
                as: 'deptId',
                in: '$$deptId'
              }
            }
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'uniqueDepartmentIds',
            foreignField: '_id',
            as: 'departments'
          }
        },
        {
          $project: {
            appointments: 0,           // Exclude the appointments field
            uniqueDepartmentIds: 0,    // Exclude the uniqueDepartmentIds field
            departments: {
              hospitalId: 0,
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: ((pageIndex - 1) * (pageSize || 25)) || 0 },
        { $limit: pageSize || 25 }
      ]);


      // query object to calculate count
      const queryObj = {
        $and: [
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { phone: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } },
              { patientId: { $regex: query, $options: 'i' } },
            ],
          },
          { isActive: true },
          { hospitalId: hospitalId }
        ],
      };


      // const patients = await Patient.find(queryObj).sort({ createdAt: -1 }).limit(pageSize || 25)
      //   .skip(((pageIndex - 1) * pageSize) || 0)
      const count = await Patient.countDocuments(queryObj);

      return { count, patients };

    } catch (error) {
      console.log(error)
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async deletePatient(id) {
    try {

      const patientData = await Patient.findOne({ _id: id });
      if (!patientData) {
        throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'Patient with provided id not found')
      }
      const patients = await Patient.findByIdAndUpdate(id, { isActive: false }, { new: true });

      return patients;

    } catch (error) {
      console.log(error)
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async uploadPatientDocuments(patientId, hospitalId, userId, customFileName, multerFileObject) {
    try {

      const fileName = customFileName ? `${customFileName}_${multerFileObject.filename}` : multerFileObject.filename

      const s3path = `${hospitalId.toString()}/${patientId.toString()}/${fileName}`

      const fileContent = fs.readFileSync(multerFileObject.path)

      const result = await s3Service.uploadFileToS3(process.env.BUCKET_NAME, s3path, fileContent, multerFileObject.mimetype)

      const docObj = {
        filePath: s3path,
        fileName: fileName,
        fileSize: multerFileObject.size,
        s3url: result,
        uploadedBy: userId,
        uploadedAt: new Date().getTime(),
        isActive: true
      }

      await Patient.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(patientId) }, { $push: { docs: docObj } }, { new: true })

      FileHelper.deleteFile(multerFileObject.path)

      return docObj
    } catch (error) {
      console.log(error)
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
      FileHelper.deleteFile(multerFileObject.path)
    }
  }

  async deleteDocs(patientId, filePath, hospitalId) {
    try {
      const patientData = await Patient.findOne({ _id: patientId })

      if (!patientData) {
        throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Patient found')
      }

      if (patientData.hospitalId.toString() !== hospitalId.toString()) {
        throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'Not Authorized')
      }
      const result = await Patient.updateOne(
        { _id: patientId },
        { $pull: { docs: { filePath } } }
      );
      await s3Service.deleteObjectFromBucket(process.env.BUCKET_NAME, filePath)

      return result

    } catch (error) {
      console.log(error)
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async deleteMultipleDocs(patientId, filePathArray, hospitalId) {
    try {
      const patientData = await Patient.findOne({ _id: patientId })

      if (!patientData) {
        throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'No Patient found')
      }

      if (patientData.hospitalId.toString() !== hospitalId.toString()) {
        throw new APIError('BAD_INPUT', HttpStatusCode.BAD_INPUT, true, 'Not Authorized')
      }

      const results = []

      for (let filePath of filePathArray) {
        const result = await Patient.updateOne(
          { _id: patientId },
          { $pull: { docs: { filePath } } }
        );
        await s3Service.deleteObjectFromBucket(process.env.BUCKET_NAME, filePath)
        results.push(result)
      }

      return results

    } catch (error) {
      console.log(error)
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

  async addUnverifiedPatient(body) {
    try {
      const patientId = await this.generatePatientId(body.hospitalId)
      body.patientId = patientId
      const timeStamp = new Date().getTime()
      if (body.profilePic) {
        const s3path = `${body.hospitalId.toString()}/${patientId.toString()}/${body.name}`
        base64ToImage.convert(body.profilePic, `upload/temp/${timeStamp}.png`);
        const fileContent = fs.readFileSync(`upload/temp/${timeStamp}.png`)
        const result = await s3Service.uploadFileToS3(process.env.BUCKET_NAME, s3path, fileContent, 'image/png')
        body.profilePic = result
      }

      const newPatient = await Patient.create(body);
      FileHelper.deleteFile(`upload/temp/${timeStamp}.png`)

      if (newPatient) {
        return newPatient;
      }
    } catch (error) {
      throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    }
  }

}