import { openDB } from "idb";

import { setStatus } from "../../status/status";

export const saveBatchesToIndexDB = async (batchesDataArr) => {
  const saveBatchesToIndexDBPromise = new Promise(async (resolve, reject) => {
    try {
      for (let index = 0; index < batchesDataArr.length; index++) {
        const {
          batchHash,
          batchWithFileData: batcheBlob,
          endBatchIndex,
          fileName,
          fileSize,
        } = batchesDataArr[index];
        const dbName = batchHash;
        const db = await openDB(dbName, 1, {
          upgrade(db) {
            db.createObjectStore("blob");
          },
        });
        await db.put("blob", batcheBlob, "data");
        const status =
          endBatchIndex !== fileSize
            ? `<h2>
        ${(endBatchIndex / 1000 / 1000).toFixed(
          2
        )} MB has been saved ${fileName} file out of ${fileSize} MB 
          </h2>`
            : `<h2>
          All File Received Successfully ${fileName}</h2>`;
        setStatus(status);
        db.close();
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
  return await saveBatchesToIndexDBPromise;
};
