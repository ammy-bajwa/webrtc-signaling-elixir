import { alivaWebRTC } from "../index";

import { sendBatchOfChunks } from "../sendBatchOfChunks/sendBatchOfChunks";

export const waitForBatchConfirmation = (
  fileName,
  batchKey,
  batchHash,
  batchOfChunksIDB,
  endBatchIndex,
  fileSize
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataChannel =
        alivaWebRTC.filesPeerConnections[fileName].dataChannels["shareInfo_1"]
          .dataChannel;
      let batchConfirmationPayload = {
        isConfirmation: true,
        batchKey,
        batchHash,
        fileName,
        endBatchIndex,
        fileSize,
      };
      batchConfirmationPayload = JSON.stringify(batchConfirmationPayload);
      let isConfirmed = false;
      dataChannel.onmessage = async (event) => {
        try {
          const { batchHash, isTotalBatchReceived, missingChunks } = JSON.parse(
            event.data
          );
          console.log("Confirmation: ", {
            isTotalBatchReceived,
            batchHash,
            missingChunks,
            fileName,
          });
          if (!isTotalBatchReceived) {
            const resendChunkObj = {};
            for (let index = 0; index < missingChunks.length; index++) {
              const chunkKey = missingChunks[index];

              const resendChunk = batchOfChunksIDB[chunkKey];
              if (resendChunk) {
                resendChunkObj[chunkKey] = resendChunk;
              }
            }
            console.log("Resending batch: ", resendChunkObj);
            console.log("Resending batch hash: ", batchHash);
            console.log("Resending fileName: ", fileName);
            await sendBatchOfChunks(fileName, resendChunkObj, batchHash);
            dataChannel.send(batchConfirmationPayload);
            console.log("Confirmation resend: ", fileName);
            setTimeout(() => {
              if (!isConfirmed) {
                dataChannel.send(batchConfirmationPayload);
              }
            }, 4000);
            // resolve(true);
          } else {
            isConfirmed = true;
            resolve(true);
          }
        } catch (error) {
          console.error(error);
        }
      };
      dataChannel.send(batchConfirmationPayload);
    } catch (error) {
      reject(error);
    }
  });
};
