import { openDB } from "idb";

export const getConfirmationBatch = (batchHash, batchKey, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const db = await openDB(dbName, 1);
      const storeName = `filesMetadata`;
      const fileMetadata = await db.get(storeName, fileName);
      const batchMetadata = fileMetadata["batchesMetaData"][batchKey];
      db.close();
      resolve(batchMetadata);
    } catch (error) {
      reject(error);
    }
  });
};
