import { alivaWebRTC } from "../index";

import { getFileMetadataFromIndexedDB } from "../../idbUtils/getFileMetadataFromIndexedDB/getFileMetadataFromIndexedDB";

import { loadBatchOfChunks } from "../../idbUtils/loadBatchOfChunks/loadBatchOfChunks";

import { sendBatchOfChunks } from "../sendBatchOfChunks/sendBatchOfChunks";

import { waitForBatchConfirmation } from "../waitForBatchConfirmation/waitForBatchConfirmation";

import { isBatchAlreadyExistOnReceiver } from "../isBatchAlreadyExistOnReceiver/isBatchAlreadyExistOnReceiver";

export const sendFile = (fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileMetadata = await getFileMetadataFromIndexedDB(fileName);
      const batchesMetadata = fileMetadata["batchesMetaData"];
      const batchesKeys = Object.keys(batchesMetadata);
      const currentDcCount = Object.keys(alivaWebRTC.dataChannels).length;
      console.log("batchesKeys: ", batchesKeys);
      if (currentDcCount < 4) {
        await alivaWebRTC.settingUpDatachannels(400);
      } else {
        console.log(`${currentDcCount} data channels already exists`);
      }
      debugger;
      for (let key = 0; key < batchesKeys.length; key++) {
        const batchKey = batchesKeys[key];
        const { batchHash, totalChunksCount, endBatchIndex } = batchesMetadata[
          batchKey
        ];
        // We will send these batch of chunks to other peer
        const batchOfChunksIDB = await loadBatchOfChunks(
          batchHash,
          endBatchIndex,
          totalChunksCount
        );

        const isBatchExists = await isBatchAlreadyExistOnReceiver(batchHash);
        if (!isBatchExists) {
          await sendBatchOfChunks(batchOfChunksIDB, batchHash);
          await waitForBatchConfirmation(
            fileName,
            batchKey,
            batchHash,
            batchOfChunksIDB
          );
          console.log("Batch is sended: ", batchKey);
        }
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};