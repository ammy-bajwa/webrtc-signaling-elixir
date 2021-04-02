import { openDB } from "idb";

export const addSubBatchHashToBatchMetadata = (
  fileName,
  subBatchKey,
  subBatchHash
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const db = await openDB(dbName, 1);
      const key = fileName;
      const fileMetadata = await db.get("filesMetadata", key);
      const { subBatchesMetaData } = fileMetadata;
      subBatchesMetaData[subBatchKey] = {
        ...subBatchesMetaData[subBatchKey],
        subBatchHash,
      };

      const value = {
        ...fileMetadata,
        subBatchesMetaData,
      };
      await db.put("filesMetadata", value, key);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
