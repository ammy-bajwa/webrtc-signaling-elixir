import { addFileDataToChunks } from "../addFileDataToChunks/addFileDataToChunks";

import { getHashOfArraybuffer } from "../../../../fileUtils/getHashOfArraybuffer/getHashOfArraybuffer";
import { addSubBatchHashToBatchMetadata } from "../../../../idbUtils/addSubBatchHashToBatchMetadata/addSubBatchHashToBatchMetadata";
import { setStatus } from "../../../../status/status";

export const populateSubBatchesWithData = async (file, subBatchesMetaData) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (const subBatchKey in subBatchesMetaData) {
        if (Object.hasOwnProperty.call(subBatchesMetaData, subBatchKey)) {
          const {
            fileName,
            startBatchIndex,
            endBatchIndex,
          } = subBatchesMetaData[subBatchKey];
          setStatus(`<h2>Adding sub batches hashes to ${fileName}</h2>`);
          const batchBlob = await addFileDataToChunks(
            file,
            startBatchIndex,
            endBatchIndex
          );

          const batchArr = await batchBlob.arrayBuffer();
          const batchHash = await getHashOfArraybuffer(batchArr);
          await addSubBatchHashToBatchMetadata(
            fileName,
            subBatchKey,
            batchHash
          );

          console.log("batchHash: ", batchHash);
        }
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
