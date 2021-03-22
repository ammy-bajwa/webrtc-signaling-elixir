import { openDB } from "idb";

export const handleReceivedChunk = (
  { fileChunk, startSliceIndex, endSliceIndex },
  batchHash
) => {
  return new Promise(async (resolve, reject) => {
    try {
      debugger;
      const dbName = batchHash;
      const db = await openDB(dbName, 1);
      const key = `${startSliceIndex}__${endSliceIndex}`;
      const value = {
        fileChunk,
        startSliceIndex,
        endSliceIndex,
      };
      await db.put("blob", value, key);
      console.log("Chunk saved in db");
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
