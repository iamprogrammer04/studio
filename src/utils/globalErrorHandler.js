const devErrorHandler = (error, res) => {
    res.status(error.statusCode).json({
        success: false,
        status: error.status,
        message: error.message,
        stackTRace: error.stack,
        error
    })
}

const prodErrorHandler = (error, res) => {
    res.status(500).json({
        success: 'false',
        message: "Uncaught Error occured",
        details: error.details ?? undefined
    })
}


const globalErrorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500

    if (process.env.NODE_ENV === 'development')
        devErrorHandler(error, res)

    if (process.env.NODE_ENV === 'production')
        prodErrorHandler(error, res)
}

// Listen for uncaught exceptionserror.statusCode
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

export default globalErrorHandler