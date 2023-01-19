
import { Firestore } from '@google-cloud/firestore'

const firestore = new Firestore();
firestore.settings({
    ignoreUndefinedProperties: true
});

export class MyStore {
    // https://www.npmjs.com/package/@google-cloud/firestore
    static async runTransaction(theFunction) {
        return await firestore.runTransaction(theFunction);
    }

    static async readByIds(collection, ids, firestoreInstance = null) {
        const lista = [];
        const theJson = {};
        if (ids.length == 0) {
            return theJson;
        }
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            lista.push(firestore.doc(`${process.env.ENV}-${collection}/${id}`));
        }
        let response;
        if (firestoreInstance == null) {
            response = await firestore.getAll(...lista);
        } else {
            response = await firestoreInstance.getAll(...lista);
        }
        for (let j = 0; j < response.length; j++) {
            const doc = response[j];
            const data = doc.data();
            data.id = doc.id;
            theJson[data.id] = data;
        }
        return theJson;
    }

    static async readById(collection, id, firestoreInstance = null) {
        const document = firestore.doc(`${process.env.ENV}-${collection}/${id}`);
        let doc;
        if (firestoreInstance == null) {
            doc = await document.get();
        } else {
            doc = await firestoreInstance.get(document);
        }
        const theJson = doc.data();
        if (theJson) {
            theJson.id = id;
        }
        return theJson;
    }

    static async create(collection, payload, firestoreInstance = null) {
        const elDoc = firestore.collection(`${process.env.ENV}-${collection}`).doc();
        if (firestoreInstance == null) {
            await elDoc.set(payload);
        } else {
            firestoreInstance.set(elDoc, payload);// no retorna promesa, sino la misma instancia
        }
    }

    static async createById(collection, id, payload, firestoreInstance = null) {
        const document = firestore.doc(`${process.env.ENV}-${collection}/${id}`);
        if (firestoreInstance == null) {
            await document.set(payload);
        } else {
            firestoreInstance.set(document, payload);// no retorna promesa, sino la misma instancia
        }
        return document;
    }

    static async updateById(collection, id, payload, firestoreInstance = null) {
        const document = firestore.doc(`${process.env.ENV}-${collection}/${id}`);
        if (firestoreInstance == null) {
            await document.update(payload);
        } else {
            firestoreInstance.update(document, payload);// no retorna promesa, sino la misma instancia
        }
    }

    static async deleteById(collection, id, firestoreInstance = null) {
        const document = firestore.doc(`${process.env.ENV}-${collection}/${id}`);
        if (firestoreInstance == null) {
            await document.delete();
        } else {
            firestoreInstance.delete(document);// no retorna promesa, sino la misma instancia
        }
    }

    static async paginate(collection, orderColumns, offset = 0, pageSize = 20, where = [], firestoreInstance = null) {
        const collectionReference = firestore.collection(`${process.env.ENV}-${collection}`);
        let theQuery = collectionReference;
        for (let i = 0; i < orderColumns.length; i++) {
            const orderColumn = orderColumns[i];
            theQuery = theQuery.orderBy(orderColumn.name, orderColumn.dir);
        }

        for (let i = 0; i < where.length; i++) {
            const aWhere = where[i];
            theQuery = theQuery.where(aWhere.key, aWhere.oper, aWhere.value)
        }
        let documents;

        theQuery = theQuery
            .offset(offset)
            .limit(pageSize);

        if (firestoreInstance == null) {
            documents = await theQuery.get();
        } else {
            documents = await firestoreInstance.get(theQuery);
        }

        const data = documents.docs.map((d) => {
            const temp = d.data();
            temp.id = d.id;
            return temp;
        });
        return data;
    }
}


