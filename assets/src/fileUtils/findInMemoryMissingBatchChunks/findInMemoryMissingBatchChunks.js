import { getBatchMetadata } from "../../idbUtils/getBatchMetadata/getBatchMetadata";
import { causeDelay } from "../../utils/causeDelay";

import { alivaWebRTC } from "../../webrtc/index";

export const findInMemoryMissingBatchChunks = function (
  fileName,
  batchKey,
  batchHash,
  inMemoryBatchChunks
) {
  return new Promise(async (resolve, reject) => {
    try {
      let batchesMetadata = await getBatchMetadata(
        fileName,
        batchHash,
        batchKey
      );
      if (!batchesMetadata?.totalChunksCount) {
        await causeDelay(1000);
        batchesMetadata = await getBatchMetadata(fileName, batchHash, batchKey);
        if (!batchesMetadata?.totalChunksCount) {
          resolve([]);
        }
      }
      const difference = alivaWebRTC.chunkSize;
      let missingChunks = [];
      let startHelperIndex = 0;
      let endHelperIndex = difference;
      for (let index = 0; index < batchesMetadata.totalChunksCount; index++) {
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
