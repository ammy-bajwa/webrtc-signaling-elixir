import { openDB } from "idb";

export const saveReceiveSubBatchdMetadata = (fileName, receivedData) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("receivedData: ", receivedData);
      const dbName = "files";
      const storeName = "filesMetadata";
      const key = fileName;
      const db = await openDB(dbName, 1, {
        upgrade(db) {
          db.createObjectStore(storeName);
        },
      });
      const existedValue = await db.get(storeName, key);
      if (existedValue) {
        let value = {};
        if (!existedValue?.isReceived) {
          db.close();
          resolve(true);
          return;
        } else {
          if (existedValue.subBatchesMetaData) {
            const subBatches = {
              ...existedValue.subBatchesMetaData,
              ...receivedData.subBatchesMetaData,
            };
            value = {
              ...existedValue,
              subBatchesMetaData: {
                ...subBatches,
              },
            };
          } else {
            value = {
              ...existedValue,
              subBatchesMetaData: {
                ...receivedData.subBatchesMetaData,
              },
            };
          }
        }
        console.log("value: ", value);
        await db.put(storeName, value, key);
        db.close();
        resolve(true);
      } else {
        console.error("no value in setting sub batch: ", fileName);
        reject(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};
