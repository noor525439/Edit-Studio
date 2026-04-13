

export const SuccessCode = (statusCode, message) => {
    return {
        success: true,
        statusCode,
        message
    }
}
export const ErrorCode = (statusCode, message) => {
    return {
        success: false,
        statusCode,
        message
    }

}