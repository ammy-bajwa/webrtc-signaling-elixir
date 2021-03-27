import { openDB } from "idb";

export const saveFileMetadataInIndexedDB = async (
  fileName,
  fileSize,
  batchesMetaData
) => {
  const saveFileMetadataToIDBPromise = new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const db = await openDB(dbName, 1, {
        upgrade(db) {
          db.createObjectStore("filesMetadata");
        },
      });
      const key = fileName;
      const value = {
        fileName,
        fileSize,
        batchesMetaData,
        isReceived: false,
        isOnlyMetadata: false,
      };
      await db.put("filesMetadata", value, key);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
  return await saveFileMetadataToIDBPromise;
};
