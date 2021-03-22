import { openDB } from "idb";

export const getAllBatchKeys = function (batchHash) {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = batchHash;
      const db = await openDB(dbName, 1);
      const batchKeys = await db.getAllKeys("filesMetadata");
      db.close();
      resolve(batchKeys);
    } catch (error) {
      reject(error);
    }
  });
};
