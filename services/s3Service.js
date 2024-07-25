import AWSService from './awsService.js';

const awsService = new AWSService();

class S3Service {
    
    constructor() {
        this.AWS = awsService.getAWS();
        this.s3 = new this.AWS.S3();
    }

    // Upload file to S3
    async uploadFileToS3(bucketName, fileName, fileContent, mimetype) {
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileContent,
            ACL:'public-read',
            ContentType:mimetype
        };

        try {
            const data = await this.s3.upload(params).promise();
            return data.Location;
        } catch (err) {
            console.error("Error uploading file:", err);
            throw err;
        }
    }

    // List objects in a bucket
    async listObjectsInBucket(bucketName) {
        const params = {
            Bucket: bucketName
        };

        try {
            const data = await this.s3.listObjects(params).promise();
            return data.Contents;
        } catch (err) {
            console.error("Error listing objects:", err);
            throw err;
        }
    }

    // Delete an object from a bucket
    async deleteObjectFromBucket(bucketName, objectKey) {
        const params = {
            Bucket: bucketName,
            Key: objectKey
        };

        try {
            await this.s3.deleteObject(params).promise();
        } catch (err) {
            console.error("Error deleting object:", err);
            throw err;
        }
    }
}

export default S3Service;
