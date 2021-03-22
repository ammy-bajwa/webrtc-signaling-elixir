import { openDB } from "idb";

import { getHashOfArraybuffer } from "../../fileUtils/getHashOfArraybuffer/getHashOfArraybuffer";

export const checkIfAlreadyExist = (dbName) => {
  return new Promise(async (resolve, reject) => {
    try {
      let isAlreadyExist = true;
      const db = await openDB(dbName, 1, {
        upgrade() {
          isAlreadyExist = false;
        },
      });
      if (!isAlreadyExist) {
        resolve(isAlreadyExist);
        return
      }
      const key = "data";
      const batchBlob = await db.get("blob", key);
      if (!batchBlob) {
        isAlreadyExist = false;
      } else {
        const batchArrBuffer = await batchBlob.arrayBuffer();
        const currentIdbBatchHash = await getHashOfArraybuffer(batchArrBuffer);
        if (currentIdbBatchHash !== dbName) {
          isAlreadyExist = false;
        }
      }
      db.close();
      resolve(isAlreadyExist);
    } catch (error) {
      reject(error);
    }
  });
};
