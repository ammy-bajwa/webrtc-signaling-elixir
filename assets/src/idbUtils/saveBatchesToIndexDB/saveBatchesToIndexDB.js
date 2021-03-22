import { openDB } from "idb";

export const saveBatchesToIndexDB = async (batchesDataArr) => {
  const saveBatchesToIndexDBPromise = new Promise(async (resolve, reject) => {
    try {
      for (let index = 0; index < batchesDataArr.length; index++) {
        const { batchHash, batchWithFileData: batcheBlob } = batchesDataArr[
          index
        ];
        const dbName = batchHash;
        const db = await openDB(dbName, 1, {
          upgrade(db) {
            db.createObjectStore("blob");
          },
        });
        await db.put("blob", batcheBlob, "data");
        db.close();
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
  return await saveBatchesToIndexDBPromise;
};
