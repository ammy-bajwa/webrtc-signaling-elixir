import { openDB } from "idb";

export const getFileChunkFromIDB = (
  fileName,
  startSliceIndex,
  endSliceIndex
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = `file__${fileName}`;
      const db = await openDB(dbName, 1);
      const key = `${startSliceIndex}__${endSliceIndex}`;
      const fileChunk = await db.get("chunks", key);
      db.close();
      resolve(fileChunk);
    } catch (error) {
      reject(error);
    }
  });
};
