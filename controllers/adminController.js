import adminService from "../services/adminServices.js"

const AdminService=new adminService()

export default class adminController{
    constructor(){}
    
    async login (req,res,next) {
        try {

            let { email, password } = req.body

            let result = await AdminService.Adminlogin(email.toLowerCase(), password)
            return res.status(200).json({ msg: 'Success', result })
        } catch (error) {
            next(error)
        }

    }

    // forgotPassword=async(req,res,next)=>{
    //     try{
    //         let {email}=req.body
    //         let result=await AdminService.forgotPassword(email)
    //         return res.status(200).json({ msg: 'Reset Link has been sent to your email.', result })
    //     } catch (error){
    //         next(error)
    //     }
    // }
    // resetPassword=async (req,res,next)=>{
    //         try {
    //             const token=req.params.id
    //             const {password}=req.body
    //             if(!token)  return res.status(400).json({ msg: 'Token not found' })
    //             let result =await AdminService.resetPassword(token,password)
    //             return res.status(200).json({ msg: 'Password changed successfully', result })
    //         } catch (error){
    //             next(error)
    //         }
    // }
    
    async userList (req,res,next) {
        try {
            const {hospitalId}=req.body
            const result = await AdminService.userList(hospitalId)
            return res.status(200).json({ msg: 'Admins Fetched Successfully', users:result })

        } catch (error) {
            next(error)
        }
    }

    async changePassword (req,res,next) {
        try {
            const {id,password}=req.body
            const result = await AdminService.changePassword({id,password})
            return res.status(200).json({ msg: 'Admins Fetched Successfully', result })

        } catch (error) {
            next(error)
        }
    }



    //Onboard doctors controller
    async onboardDoctor(req, res, next) {
        try {
            const doctorData = req.body;
            const result = await AdminService.onboardDoctor(doctorData);
            return res.status(201).json({ msg: 'Doctor onboarded successfully', result });
        } catch (error) {
            next(error);
        }
    }
}