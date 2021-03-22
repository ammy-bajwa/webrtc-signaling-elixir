import { openDB } from "idb";

export const getBatchMetadata = function (fileName, batchHash, batchKey) {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const storeName = "filesMetadata";
      const db = await openDB(dbName, 1);
      const { batchesMetaData } = await db.get(storeName, fileName);
      const batchMetadataObj = batchesMetaData[batchKey];
      db.close();
      resolve(batchMetadataObj);
    } catch (error) {
      reject(error);
    }
  });
};
