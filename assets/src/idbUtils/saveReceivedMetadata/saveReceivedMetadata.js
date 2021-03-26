import { openDB } from "idb";

export const saveReceivedMetadata = (
  fileName,
  fileSize,
  batchesMetaData,
  fileHash
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const storeName = "filesMetadata";
      const key = fileName;
      const db = await openDB(dbName, 1, {
        upgrade(db) {
          db.createObjectStore(storeName);
        },
      });
      let value = {
        fileName,
        fileSize,
        batchesMetaData,
        isReceived: true,
        isOnlyMetadata: true,
        fileHash,
      };
      const existedValue = await db.get(storeName, key);
      if (existedValue) {
        if (!existedValue?.isReceived) {
          db.close();
          resolve(true);
          return;
        }
        value.batchesMetaData = {
          ...existedValue.batchesMetaData,
          ...batchesMetaData,
        };
      }
      await db.put(storeName, value, key);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
