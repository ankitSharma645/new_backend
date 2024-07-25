import AWS from 'aws-sdk';
import dotenv from "dotenv";
dotenv.config()

class AWSService {
    constructor() {
        this.region = process.env.AWS_REGION;
        this.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        this.secretAccessKey = process.env.AWS_ACCESS_KEY;
        this.AWS = AWS;
        this.AWS.config.update({
            region: this.region,
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey
        });
    }

    getAWS() {
        return this.AWS;
    }
}

export default AWSService;
