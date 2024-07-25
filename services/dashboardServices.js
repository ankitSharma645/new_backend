import APIError from '../exceptions/errorHandler.js'
import { FormatDate } from '../helpers/dateFormat.js'
import Appointment from '../models/appointmentModel.js'
import Department from '../models/departmentModel.js'

const DateHandler = new FormatDate()
class DashboardServices {
    constructor() { }

    async getCardsData(query, hospitalId) {
        try {
            const todaysDate= new Date().getTime()
            const todaysMidnightStart =await DateHandler.midnightTime(todaysDate)
            const todaysMidnightEnd =await DateHandler.midnightTime(todaysDate+(24 * 60 * 60 * 1000))
            let dateFilterStart = 0
            let dateFilterEnd = 0
            if (query == "daily")
            {
                dateFilterStart = todaysMidnightStart;
                dateFilterEnd=todaysMidnightEnd
            } 
            
            if (query == "weekly") {
                const {previousSunday,nextSunday}=await DateHandler.weekStartEnd(todaysDate)
                dateFilterStart = previousSunday;
                dateFilterEnd=nextSunday
            }
            if (query == "monthly") {
                const {startOfMonth,endOfMonth}=await DateHandler.monthStartEnd(todaysDate)
                dateFilterStart = startOfMonth;
                dateFilterEnd=endOfMonth
            }
            const timestamps = await Appointment.find({hospitalId:hospitalId, date: { $gt: dateFilterStart, $lt: dateFilterEnd } }, { date: 1 });

            const daysCount = await DateHandler.timestampCount(timestamps)

            const totalAppointment = await Appointment.countDocuments({hospitalId:hospitalId, date: { $gt: dateFilterStart, $lt: dateFilterEnd } })
            const pendingAppointment = await Appointment.countDocuments({hospitalId:hospitalId, date: { $gt: dateFilterStart, $lt: dateFilterEnd }, status: "Scheduled" })
            const completedAppointment = await Appointment.countDocuments({hospitalId:hospitalId, date: { $gt: dateFilterStart, $lt: dateFilterEnd }, status: "Completed" })
            const cancelledAppointment = await Appointment.countDocuments({hospitalId:hospitalId, date: { $gt: dateFilterStart, $lt: dateFilterEnd }, status: "Cancelled" })

            const departmentNames = await Department.find();
            const departmentDataArray =[]
             await Promise.all(
                departmentNames.map(async department => {
                 const count= await Appointment.countDocuments({hospitalId:hospitalId,departmentId:department._id,date: { $gt: dateFilterStart, $lt: dateFilterEnd } })
                 departmentDataArray.push({name:department.name,count})
                })
              );


            const dashboardData = {
                barData: {
                    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    data: daysCount
                },
                cardData: [
                    { title: 'Total', value: totalAppointment },
                    { title: 'Pending', value: pendingAppointment },
                    { title: 'Completed', value: completedAppointment },
                    { title: 'Cancelled', value: cancelledAppointment },
                ],
                chartData: departmentDataArray,
                
            }
            return dashboardData
        } catch (error) {
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }

}

export default DashboardServices 