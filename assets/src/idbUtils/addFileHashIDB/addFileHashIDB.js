import { openDB } from "idb";

import { getHashOfData } from "../../fileUtils/getHashOfData/getHashOfData";

export const addFileHashIDB = (fileName, batchesHashes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = "files";
      const db = await openDB(dbName, 1);
      const key = fileName;
      const fileMetadata = await db.get("filesMetadata", key);
      const fileHash = await getHashOfData(batchesHashes);
      const value = {
        ...fileMetadata,
        fileHash,
      };
      await db.put("filesMetadata", value, key);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
