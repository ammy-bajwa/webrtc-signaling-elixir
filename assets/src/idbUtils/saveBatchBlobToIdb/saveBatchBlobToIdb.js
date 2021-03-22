import { openDB } from "idb";

export const saveBatchBlobToIdb = function (batchHash, batchBlob) {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = batchHash;
      const db = await openDB(dbName, 1);
      await db.put("blob", batchBlob, "data");
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
