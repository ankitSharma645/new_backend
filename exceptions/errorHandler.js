export const HttpStatusCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED_REQUEST: 401,
    NOT_FOUND: 404,
    BAD_INPUT: 422, // For Validation
    INTERNAL_SERVER: 500,
};
class BaseError extends Error {
    name;
    httpCode;
    isOperational;
    constructor(name, httpCode, isOperational, description) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}
export default class APIError extends BaseError {
    constructor(name = 'INTERNAL_ERROR', httpCode = HttpStatusCode.INTERNAL_SERVER, isOperational = false, description = 'Internal server error') {
        super(name, httpCode, isOperational, description);
    }
}
export const returnError = async (err, req, res, next) => {
    let error;
    if (err?.response?.status) error = err.response.data.errors[0];
    else error = err;
    console.log('Error is: ', error.message);
    if (error.isOperational) res.status(error.httpCode || 500).json({ error: { message: error.message, isOperational: error.isOperational, httpCode: error.httpCode || 500 } });
    else res.status(error.httpCode || 500).json({ errors: { message: 'Internal server error.', isOperational: false, httpCode: error.httpCode || 500 } });
};
