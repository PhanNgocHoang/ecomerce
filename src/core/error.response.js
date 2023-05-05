
const StatusCode = {
    FORBIDEN: 403,
    CONFLICT: 409
}

const ResponseStatusCode = {
    FORBIDEN: 'Bad request error',
    CONFLICT: 'Conflict error'
}
const  {StatusCodes, ReasonPhrases} = require('../utils/httpStatusCode')

class ErrorResponse extends Error {
    constructor(message, status){
        super(message)
        this.status = status
    }
}

class ConflicRequestError extends ErrorResponse {
    constructor(message = ResponseStatusCode.CONFLICT, statusCode = StatusCode.FORBIDEN){
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ResponseStatusCode.CONFLICT, statusCode = StatusCode.FORBIDEN) {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = ReasonPhrases.UNAUTHORIZED, status = StatusCodes.UNAUTHORIZED){
        super(message, status)
    }
}
class NotFoundError extends ErrorResponse {
    constructor(message = ReasonPhrases.NOT_FOUND, status = StatusCodes.NOT_FOUND) {
        super(message, status)
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message = ReasonPhrases.FORBIDDEN, status = StatusCodes.FORBIDDEN) {
        super(message, status)
    }
}

module.exports = {
    ConflicRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError
}