import APIError, { HttpStatusCode } from "../exceptions/errorHandler.js"
import Admin from "../models/adminModel.js"
import jwt from 'jsonwebtoken'
import encryption from "../helpers/encryption.js"
import { transporter } from "../config/sendMail.js"
import Doctor from '../models/doctorModel.js';
import Hospital from '../models/hospitalModel.js'
const encryptionData =new encryption()
export default class admin{
    constructor(){}

    async generateToken (userId, hospitalId,userRole, time) {
        try {
    
            //generate new token
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
    
    
            let generatedTime = new Date().getTime()
            let tokenExpiryTime = generatedTime + time   // Token Expires In 1 Day
    
            let data = {
                userId: userId,
                hospitalId:hospitalId,
                userRole:userRole,
                tokenExpiryTime: tokenExpiryTime
            }
            const token = jwt.sign(data, jwtSecretKey);
    
            return {
                token: token,
                expiresAt: tokenExpiryTime
            }
    
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }


    async Adminlogin (email, password) {
        try {
            //#region User Pipeline
            let userPipeline = [
                {
                    $project: {
                        email: { $toLower: '$email' },
                        password: '$password',
                        name: '$name',
                        hospitalId:'$hospitalId',
                        userRole:'$userRole'
                    }
                },
                {
                    $match: {
                        email: email
                    }
                }
            ]
            //#endregion
    
            let result = await Admin.aggregate(userPipeline)
            if (result.length == 0) {
                throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'This User Does Not Exist.');
            }
    
            let userDetails = result[0]
    
            let hashedPassword = userDetails.password
    
            let isPasswordMatched = await encryptionData.compareData(password, hashedPassword)
    
            if (isPasswordMatched) {
    
                // getting Token of User
                let tokenObj = await this.generateToken(userDetails._id,userDetails.hospitalId,userDetails.userRole, 24 * 60 * 60 * 1000)
    
                return {
                    token: tokenObj.token,
                    expiresAt: tokenObj.expiresAt,
                    userName: userDetails.name,
                    userRole:userDetails.userRole
                }
            }
            else {
                throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'Password Does not match.');
            }
    
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    // forgotPassword=async(email)=>{ 
    //     try {
    //         const result=await Admin.find({email})
    //         const userData=result[0]
    //         if(!userData)  throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'This User Does Not Exist.');
    
    //         const expiryTime=5 * 60 * 1000 //5 min
    //         const token=await this.generateToken(userData._id,userData.hospitalId,expiryTime)
    //         const change=await Admin.findByIdAndUpdate(userData._id,{token:token.token},{new:true})
       
    //         const resetLink="http://localhost:3000/reset-password/"+token.token
    //         const info = await transporter.sendMail({
    //             from: 'sumit@algodrive.com', // sender address
    //             to: userData.email, // list of receivers
    //             subject: "Reset Password", // Subject line
    //             text: "Hello world?", // plain text body
    //             html: `<div><p>Hello ${userData.name},</p>
    //             <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
    //             <p>To reset your password, click the link below:</p>
    //             <p>
    //               <a href=${resetLink} style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 3px;">Reset Password</a>
    //             </p>
    //             <p>If you're having trouble with the button above, you can also copy and paste the following link into your web browser:</p>
    //             <p>${resetLink}</p>
    //             <p>This link will expire in 5 min.</p>
    //             </div>`, // html body
    //           });
    
    //           return info
    
    //     } catch (error) {
    //         throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    //     }
    // }

    // resetPassword=async(token,password)=>{
    //     try {
    //         console.log(token)
    //         // tokenValidator(token)
    //         const userData=await Admin.find({token})
    //         if (userData.length===0)   throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'Invalid Token');
        
    //         if(!token) throw new APIError("UNAUTHORIZED_REQUEST", HttpStatusCode.UNAUTHORIZED_REQUEST, true, 'Token expired');
    //         const updatePassword=await Admin.findByIdAndUpdate(userData[0]._id,{password,token:""},{new:true})
        
    //         return updatePassword
    //     } catch (error) {
    //         throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
    //     }
    //     }

    async userList (hospitalId){
        try {
            const adminList=await Admin.find({hospitalId})
            return adminList
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

    async changePassword ({id,password}){
        try {

            const encryptedPassword=await encryptionData.encryptData(password)
            const updatedAdmin=await Admin.findByIdAndUpdate({_id:id},{$set:{password:encryptedPassword}})
            return updatedAdmin
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }


    //doctors Onboards services code 

    async onboardDoctor(data) {
        const { name, mobile, licenseNumber, email, hospitalId, experience, qualifications } = data;

        // Check if hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            throw new Error("Invalid hospital ID");
        }

        // Create a new doctor
        const doctor = new Doctor({
            name,
            mobile,
            licenseNumber,
            email,
            hospitalId,
            experience,
            qualifications,
        });

        await doctor.save();
        return doctor;
    }

}