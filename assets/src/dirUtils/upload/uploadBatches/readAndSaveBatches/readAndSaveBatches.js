import { addFileDataToChunks } from "../addFileDataToChunks/addFileDataToChunks";

import { saveBatchesToIndexDB } from "../../../../idbUtils/saveBatchesToIndexDB/saveBatchesToIndexDB";

import { setStatus } from "../../../../status/status";

import { getHashOfArraybuffer } from "../../../../fileUtils/getHashOfArraybuffer/getHashOfArraybuffer";

import { addHashToBatchMetadata } from "../../../../idbUtils/addHashToBatchMetadata/addHashToBatchMetadata";

import { addFileHashIDB } from "../../../../idbUtils/addFileHashIDB/addFileHashIDB";

import { alivaWebRTC } from "../../../../webrtc/index";

export const readAndSaveBatches = async (file, batchesMetaData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Here we will get two things
      // file and metadata of filechunks
      const batchesInMemory = alivaWebRTC.numberOfBatchesInMemory;
      const allBatchesKeys = Object.keys(batchesMetaData);
      const allBatchesKeysCount = Object.keys(batchesMetaData).length;
      const totalOuterLoopCounter = Math.ceil(
        allBatchesKeysCount / batchesInMemory
      );
      let batchesHashes = [];
      let inMemoryBatches = [];
      let batchHelperCount = 0;
      let statusHelper = 0;
      for (let index = 0; index < totalOuterLoopCounter; index++) {
        for (let index = 0; index < batchesInMemory; index++) {
          const batchKey = allBatchesKeys[batchHelperCount];
          const batchData = batchesMetaData[batchKey];
          if (batchData) {
            const { startBatchIndex, endBatchIndex, fileName } = batchData;
            const batchWithFileData = await addFileDataToChunks(
              file,
              startBatchIndex,
              endBatchIndex
            );
            const batchArr = await batchWithFileData.arrayBuffer();
            const batchHash = await getHashOfArraybuffer(batchArr);
            batchesHashes.push(batchHash);
            await addHashToBatchMetadata(fileName, batchKey, batchHash);
            const fileSize = (file["size"] / 1000 / 1000).toFixed(2);
            inMemoryBatches.push({
              batchHash,
              batchWithFileData,
              endBatchIndex,
              fileName,
              fileSize
            });
            statusHelper = endBatchIndex;
          } else {
            break;
          }
          batchHelperCount++;
          console.log("batchKey: ", batchKey);
        }
        setStatus(
          `<h2>
            Working to upload ${(statusHelper / 1000 / 1000).toFixed(
              2
            )} MB out of ${(file["size"] / 1000 / 1000).toFixed(2)} MB ${
            file["name"]
          } file
              </h2>`
        );
        await saveBatchesToIndexDB(inMemoryBatches);
        setStatus(
          `<h2>
            ${(statusHelper / 1000 / 1000).toFixed(
              2
            )} MB has been saved out of ${(file["size"] / 1000 / 1000).toFixed(
            2
          )} MB ${file["name"]} file
              </h2>`
        );
        console.log("---------------");
      }

      setStatus(`<h2>Adding hash to ${file["name"]} file</h2>`);
      await addFileHashIDB(file["name"], batchesHashes);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

// const getLastChunkStartIndex = (chunks) => {
//   const chunkKeys = Object.keys(chunks);
//   const lastKey = chunkKeys[chunkKeys.length - 1];
//   const { startSliceIndex } = chunks[lastKey];
//   return startSliceIndex;
// };
