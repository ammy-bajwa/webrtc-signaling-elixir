import { openDB } from "idb";

export const getFileMetadataFromIndexedDB = (fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const storeName = "filesMetadata";
      const db = await openDB(dbName, 1);
      const fileMetadata = await db.get(storeName, fileName);
      db.close();
      resolve(fileMetadata);
    } catch (error) {
      reject(error);
    }
  });
};
