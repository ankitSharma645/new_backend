import fs from 'fs'

class FileHelper {

    constructor() { }

    static async deleteFile(filePath) {
        try {

            fs.unlink(filePath, (err) => {
                if (err) throw err;
                return true
            });


        } catch (error) {
            console.log(error)
            return false
        }
    }

}

export default FileHelper;