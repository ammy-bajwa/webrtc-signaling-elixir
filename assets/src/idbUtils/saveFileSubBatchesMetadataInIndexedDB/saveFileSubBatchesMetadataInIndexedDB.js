import { openDB } from "idb";

export const saveFileSubBatchesMetadataInIndexedDB = async (
  fileName,
  subBatchesMetaData
) => {
  const saveFileMetadataToIDBPromise = new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const storeName = "filesMetadata";
      const db = await openDB(dbName, 1, {
        upgrade(db) {
          db.createObjectStore(storeName);
        },
      });
      const key = fileName;
      const existedValue = await db.get(storeName, key);
      const value = {
        ...existedValue,
        subBatchesMetaData,
      };
      await db.put(storeName, value, key);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
  return await saveFileMetadataToIDBPromise;
};
