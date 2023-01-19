export class Usuario {
    metadatos;
    roles;
    constructor(token) {
        this.roles = [];
        this.metadatos = token;
    }
    darUsername() {
        let respuesta = null;
        if (this.metadatos != null) {
            const contenedor = this.metadatos["firebase"];
            const identidades = contenedor["identities"];
            respuesta = { dominio: contenedor["sign_in_provider"] };
            if ("email" in identidades) {
                respuesta["usuario"] = identidades["email"][0];
            } else if ("phone" in identidades) {
                respuesta["usuario"] = identidades["phone"][0];
            }
        }
        return respuesta;
    }
    darId() {
        let respuesta = null;
        if (this.metadatos != null) {
            const userName = this.darUsername(this.metadatos);
            respuesta = userName["dominio"] + "/" + userName["usuario"];
        }
        return respuesta;
    }
    getIdentity() {
        const ans = {
            id: this.darId(),
            roles: this.roles,
            proveedor: this.metadatos.firebase.sign_in_provider,
            sufijo: this.darUsername()["usuario"],
            uid: this.metadatos.user_id,
        };
        return ans;
    }
}