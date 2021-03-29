import { openDB } from "idb";

export const handleAllFileReceived = function (fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("All Received")
      const db = await openDB("files", 1);
      const storeName = "filesMetadata";
      const fileMetadata = await db.get(storeName, fileName);
      const updatedFileMetadata = {
        ...fileMetadata,
        isOnlyMetadata: false,
        isReceived: false,
      };
      await db.put(storeName, updatedFileMetadata, fileName);
      db.close();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
