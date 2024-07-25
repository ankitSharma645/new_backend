import DashboardServices from "../services/dashboardServices.js";


const dashboardService = new DashboardServices()

export default class DashboardController{
    constructor(){}

    async getCardsData (req, res, next) {
        try {
           const {query} = req.query;
           const { hospitalId } = req.body
           const dashboardData = await dashboardService.getCardsData(query, hospitalId)
            return res.status(201).json({success: true, message: 'Cards Data Fetched', data:{dashboardData} });
        } catch (error) {
            next(error);
        }
    };

    
}