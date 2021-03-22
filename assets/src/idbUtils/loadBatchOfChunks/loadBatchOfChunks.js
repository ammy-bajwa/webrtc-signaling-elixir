import { openDB } from "idb";
import { alivaWebRTC } from "../../webrtc/index";

export const loadBatchOfChunks = async (
  batchHash,
  endBatchIndex,
  totalChunksCount
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = batchHash;
      const storeName = "blob";
      const db = await openDB(dbName, 1);
      const storedBlob = await db.get(storeName, "data");
      let fileChunksFromIDB = {};
      let startBlobIndex = 0;
      let endBlobIndex = 0;
      const difference = alivaWebRTC.chunkSize;
      for (let index = 0; index < totalChunksCount; index++) {
        endBlobIndex += difference;
        if (endBlobIndex >= endBatchIndex) {
          endBlobIndex = endBatchIndex;
        }
        const blockChunk = storedBlob.slice(startBlobIndex, endBlobIndex);
        const key = `${startBlobIndex}__${endBlobIndex}`;
        startBlobIndex = endBlobIndex;
        fileChunksFromIDB[key] = blockChunk;
      }
      db.close();
      resolve(fileChunksFromIDB);
    } catch (error) {
      reject(error);
    }
  });
};
