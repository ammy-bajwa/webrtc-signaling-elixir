import { alivaWebRTC } from "../index";

import { getBatchMetadata } from "../../idbUtils/getBatchMetadata/getBatchMetadata";

export const batchConfirmationMemory = function (
  fileName,
  batchHash,
  batchKey
) {
  return new Promise(async (resolve, reject) => {
    try {
      const inMemoryBatch = alivaWebRTC.chunks[batchHash];
      const { totalChunksCount } = await getBatchMetadata(
        fileName,
        batchHash,
        batchKey
      );
      const inMemoryBatchChunksCount = Object.keys(inMemoryBatch).length;
      if (totalChunksCount === inMemoryBatchChunksCount) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  });
};
