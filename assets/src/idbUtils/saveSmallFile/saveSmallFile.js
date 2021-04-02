import { openDB } from "idb";

export const saveSmallFile = (fileName, smallFile) => {
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
      await db.put(storeName, smallFile, key);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
