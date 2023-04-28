
export class PayUSrv {
    static ENDPOINTS = {
        "dev": "https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi",
        "pro": "https://api.payulatam.com/payments-api/4.0/service.cgi",
    }
    constructor() {
        this.setMode("dev");
    }
    setMode(mode) {
        if (["dev", "pro"].indexOf(mode) < 0) {
            throw Error("Se debe seleccionar un modo dev o pro");
        }
        this.mode = mode;
        this.endpoint = PayUSrv.ENDPOINTS[this.mode];
    }
}