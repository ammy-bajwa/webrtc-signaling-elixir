import { openDB } from 'idb';
export const getFileBatchesFromIDB = (metaData) => {
    return new Promise(async(resolve, reject) => {
        try {
            const key = "data";
            const store = "blob";
            let fileArray = [];
            let metaDataArray = Object.values(metaData);
            for (let index = 0; index < metaDataArray.length; index++) {
                const dbName = metaDataArray[index].batchHash;
                const db = await openDB(dbName, 1);
                let data = await db.get(store, key);
                fileArray.push(data);
                db.close();
            }
            let file = await new Blob(fileArray, { "type": "video\/mp4" });
            resolve(file);
        } catch (error) {
            reject(error);
        }
    });
}