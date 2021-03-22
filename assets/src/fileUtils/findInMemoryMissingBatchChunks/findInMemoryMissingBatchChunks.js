import { getBatchMetadata } from "../../idbUtils/getBatchMetadata/getBatchMetadata";

import { alivaWebRTC } from "../../webrtc/index";

export const findInMemoryMissingBatchChunks = function (
  fileName,
  batchKey,
  batchHash,
  inMemoryBatchChunks
) {
  return new Promise(async (resolve, reject) => {
    try {
      const { totalChunksCount } = await getBatchMetadata(
        fileName,
        batchHash,
        batchKey
      );
      const difference = alivaWebRTC.chunkSize;
      let missingChunks = [];
      let startHelperIndex = 0;
      let endHelperIndex = difference;
      console.log("inMemoryBatchChunks: ", inMemoryBatchChunks);
      for (let index = 0; index < totalChunksCount; index++) {
        console.log("totalChunksCount: ", totalChunksCount);
        const key = `${startHelperIndex}__${endHelperIndex}`;
        startHelperIndex = endHelperIndex;
        endHelperIndex = endHelperIndex + difference;
        const isChunkExist = inMemoryBatchChunks[key];
        if (!isChunkExist) {
          missingChunks.push(key);
        }
      }
      resolve(missingChunks);
    } catch (error) {
      reject(error);
    }
  });
};
