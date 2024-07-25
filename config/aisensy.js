import axios from 'axios'
import APIError from '../exceptions/errorHandler.js';

export class AisensyConfig {
    constructor() { }

    async sendWhatappMsg({ campaignName, destination, userName, media, templateParams }) {

        try {

            const payload = {
                apiKey: process.env.AISENSY_KEY,
                campaignName,
                destination,
                userName,
                source: "Direct",
                media,
                templateParams
            }

            const sendMsg = await axios.post("https://backend.aisensy.com/campaign/t1/api/v2", payload)
            return sendMsg
        } catch (error) {
            console.log(error,"Error from sendWhatappMsg")
            throw new APIError(error.name, error.httpCode, error.isOperational, error.message);
        }
    }
}