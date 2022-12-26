class MyError extends Error {
    constructor(message, httpCode) {
        super(message);
        this.name = "MyError";
        this.httpCode = httpCode;
    }
}

export { MyError }