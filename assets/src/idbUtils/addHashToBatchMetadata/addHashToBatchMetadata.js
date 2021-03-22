import { openDB } from "idb";

export const addHashToBatchMetadata = (fileName, batchKey, batchHash) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const db = await openDB(dbName, 1);
      const key = fileName;
      const fileMetadata = await db.get("filesMetadata", key);
      const { batchesMetaData } = fileMetadata;
      batchesMetaData[batchKey] = {
        ...batchesMetaData[batchKey],
        batchHash,
      };

      const value = {
        ...fileMetadata,
        batchesMetaData,
      };
      await db.put("filesMetadata", value, key);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
