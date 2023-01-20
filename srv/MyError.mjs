class MyError extends Error {
    constructor(message, httpCode) {
        super(message);
        this.name = "MyError";
        this.httpCode = httpCode;
    }
}

class NoAutorizadoException extends MyError { }
class NoExisteException extends MyError {
    constructor(message) {
        super(message, 204);
    }
}
class ParametrosIncompletosException extends MyError { }
class NoHayUsuarioException extends MyError { }
class MalaPeticionException extends MyError { }
class InesperadoException extends MyError { }

export {
    MyError,
    NoAutorizadoException,
    NoExisteException,
    ParametrosIncompletosException,
    NoHayUsuarioException,
    MalaPeticionException,
    InesperadoException
}