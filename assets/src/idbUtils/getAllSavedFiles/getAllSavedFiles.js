import { openDB } from "idb";

export const getAllSavedFiles = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const storeName = "filesMetadata";
      const db = await openDB(dbName, 1, {
        upgrade(db) {
          db.createObjectStore(storeName);
        },
      });
      let files = await db.getAll(storeName);
      files = files.map(
        ({ fileHash, fileName, fileSize, isReceived, batchesMetaData }) => {
          return {
            name: fileName,
            size: fileSize,
            fileHash,
            isReceived,
            batchesMetaData,
          };
        }
      );
      resolve(files);
    } catch (error) {
      reject(error);
    }
  });
};
