import multer from 'multer'
import fs from 'fs'

class MulterServices {

    constructor() { }

    static addTimestampToFilename(filename) {
        // Validate input filename
        if (!filename || typeof filename !== 'string') {
            throw new Error('Invalid filename');
        }

        const currDate = new Date();
        const day = addZero(currDate.getDate());
        const month = addZero(currDate.getMonth() + 1);
        const year = currDate.getFullYear();
        const hh = addZero(currDate.getHours());
        const mm = addZero(currDate.getMinutes());
        const ss = addZero(currDate.getSeconds());

        function addZero(num) {
            return num < 10 ? '0' + num : num;
        }

        const dateTimeString = `${day}_${month}_${year}_${hh}_${mm}_${ss}`

        // Extract file extension
        const fileExtension = filename.split('.').pop();

        // Remove file extension from filename
        const filenameWithoutExtension = filename.replace('.' + fileExtension, '');

        // Concatenate timestamp with filename
        const modifiedFilename = `${filenameWithoutExtension}_${dateTimeString}.${fileExtension}`;

        return modifiedFilename;
    }


    uploadToMulter(docPath, mimetype, fileName) {
        try {
            const upload = multer({
                storage: multer.diskStorage({
                    destination: function (req, file, cb) {
                        fs.mkdirSync(docPath, { recursive: true })
                        cb(null, docPath)
                    },
                    filename: function (req, file, cb) {
                        const ext = file.mimetype.split('/')[1];
                        cb(null, file.originalname ? MulterServices.addTimestampToFilename(file.originalname) : (file.fieldname + '_' + Date.now() + '.' + ext))
                        let fieldName = file.fieldname;
                        return fieldName;
                    }
                }),
                fileFilter: (req, file, cb, res) => {
                    if (mimetype.includes(file.mimetype.split('/')[1])) {
                        cb(null, true);
                    } else {
                        req.fileValidationError = "Forbidden extension";
                        return cb(null, false, req.fileValidationError);
                    }
                }
            });

            return upload
        } catch (error) {
            console.log(error)
        }
    }
}

export default MulterServices;