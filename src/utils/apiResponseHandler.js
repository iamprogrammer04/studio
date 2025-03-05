const apiResHandler = (message = '', data = null, success = true) => ({
    success,
    message,
    data,
});

export default apiResHandler;
