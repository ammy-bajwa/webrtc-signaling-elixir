import { alivaWebRTC } from "../index";

import { getFileMetadataFromIndexedDB } from "../../idbUtils/getFileMetadataFromIndexedDB/getFileMetadataFromIndexedDB";

import { loadBatchOfChunks } from "../../idbUtils/loadBatchOfChunks/loadBatchOfChunks";

import { sendBatchOfChunks } from "../sendBatchOfChunks/sendBatchOfChunks";

import { waitForBatchConfirmation } from "../waitForBatchConfirmation/waitForBatchConfirmation";

import { isBatchAlreadyExistOnReceiver } from "../isBatchAlreadyExistOnReceiver/isBatchAlreadyExistOnReceiver";

import { setStatus } from "../../status/status";

import { setupFilePeerConnection } from "../setupFilePeerConnection/setupFilePeerConnection";

import { requestReceiverToSetupPC } from "../requestReceiverToSetupPC/requestReceiverToSetupPC.js";

import { isAlreadyConnected } from "../isAlreadyConnected/isAlreadyConnected.js";

import { allFileSendSignal } from "../allFileSendSignal/allFileSendSignal.js";

import { cleanFilePeerConnection } from "../cleanFilePeerConnection/cleanFilePeerConnection.js";

export const sendFile = (fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileMetadata = await getFileMetadataFromIndexedDB(fileName);
      const batchesMetadata = fileMetadata["batchesMetaData"];
      const batchesKeys = Object.keys(batchesMetadata);
      // Setup new peer connection for the transmission of file
      setStatus("<h2>Setting up peerconnection and datachannels...</h2>");

      const isPcAlreadyExists = await isAlreadyConnected(fileName);
      if (!isPcAlreadyExists) {
        await alivaWebRTC.setupFilePeerConnection(fileName);
        // Request other for to create peerconnection for file
        await requestReceiverToSetupPC(fileName);
        // After successfully creating peerconnection on receiver create on in sender
        await alivaWebRTC.initializeFileDataChannels(fileName);
      }

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
        if (isBatchExists) {
          const fileSize = fileMetadata["fileSize"];
          setStatus("<h2>File chunks loading in memory and sending...</h2>");
          await sendBatchOfChunks(fileName, batchOfChunksIDB, batchHash);
          console.log("sending batch confirmation: ", fileName, batchKey);
          await waitForBatchConfirmation(
            fileName,
            batchKey,
            batchHash,
            batchOfChunksIDB,
            endBatchIndex,
            fileSize
          );
          console.log("+++");
          const status =
            endBatchIndex !== fileSize
              ? `<h2>
                ${(endBatchIndex / 1000 / 1000).toFixed(
                  2
                )} MB Have Been Send out of ${(fileSize / 1000 / 1000).toFixed(
                  2
                )} MB ${fileName} file
                 </h2>`
              : `<h2>All File Sended Successfully ${fileName}</h2>`;
          setStatus(status);
          console.log("Batch is sended: ", batchKey, fileName);
        }
      }
      await allFileSendSignal(fileName);
      await cleanFilePeerConnection(fileName);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
