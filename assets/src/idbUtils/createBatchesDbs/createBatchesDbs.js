import { openDB } from "idb";

export const createBatchesDbs = function (batchesMetadata) {
  return new Promise(async (resolve, reject) => {
    try {
      for (const batchKey in batchesMetadata) {
        if (Object.hasOwnProperty.call(batchesMetadata, batchKey)) {
          const { batchHash, chunks } = batchesMetadata[batchKey];
          const dbName = batchHash;
          const batchDb = await openDB(dbName, 1, {
            upgrade(db) {
              db.createObjectStore("batchMetadata");
              db.createObjectStore("blob");
            },
          });
          for (const chunkKey in chunks) {
            if (Object.hasOwnProperty.call(chunks, chunkKey)) {
              const { startSliceIndex, endSliceIndex } = chunks[chunkKey];
              const key = `${startSliceIndex}__${endSliceIndex}`;
              const value = {
                startSliceIndex,
                endSliceIndex,
              };
              batchDb.put("batchMetadata", value, key);
            }
          }
          batchDb.close();
        }
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
