import { MyUtilities } from "../../srcJs/MyUtilities.js";
import { MyFileService } from "../MyFileService.mjs";
import { MyConstants } from "../../srcJs/MyConstants.js";
import { MyStore } from "./MyStore.mjs";

const USER_TYPE = "user";

export class Usuario {
    metadatos = null;
    id = null;
    email = null;
    phone = null;
    constructor(token) {
        this.metadatos = token;
        if (this.metadatos != null) {
            if (this.metadatos.email) {
                this.email = this.metadatos.email;
            }
            const contenedor = this.metadatos["firebase"];
            const identidades = contenedor["identities"];
            if ("email" in identidades) {
                this.id = identidades["email"][0];
                this.email = this.id;
            } else if ("phone" in identidades) {
                this.id = identidades["phone"][0];
                this.phone = this.id;
            }
        }
    }
    static async getCurrentUser(req, res, next) {
        const user = res.locals.user;
        const token = res.locals.token;
        // Debo buscar el usuario de base de datos
        const response = await MyStore.readById(USER_TYPE, user.id);
        if (response) {
            res.status(200).send(response);
        } else {
            // Si no existe lo creo
            const AHORA = new Date().getTime();
            const email = user.email;
            const prefijoEmail = /^[^@]+/.exec(email)[0]
            const nuevo = {
                email: email,
                name: (token.name ? token.name : prefijoEmail),//El nombre será la primera parte del mail
                phone: user.phone,
            };
            const q = `${nuevo.name ? nuevo.name : ""} ${prefijoEmail}`;
            user.search = MyUtilities.partirTexto(q, true);
            if (token.picture) {
                nuevo.picture = await MyFileService.fetchUrl2Bucket(token.picture, token, "profile", "/me.jpg");
            } else {
                // Podría aquí hacerce un random
                nuevo.picture = MyConstants.USER.DEFAULT_IMAGE;
            }
            nuevo.created = AHORA;
            nuevo.updated = AHORA;
            await MyStore.createById(USER_TYPE, user.id, nuevo);
            nuevo.id = user.id;
            res.status(200).send(nuevo);
        }
    }

    static async saveMyUser(req, res, next) {
        const user = res.locals.user;
    }
}