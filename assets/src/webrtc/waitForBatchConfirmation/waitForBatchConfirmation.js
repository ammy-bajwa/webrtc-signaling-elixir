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
        alivaWebRTC.dataChannels["batchConfirmation"]?.dataChannel;
      if (!dataChannel) {
        dataChannel = await alivaWebRTC.createDataChannel("batchConfirmation");
      }
      let batchConfirmationPayload = {
        isConfirmation: true,
        batchKey,
        batchHash,
        fileName,
        endBatchIndex,
        fileSize,
      };
      batchConfirmationPayload = JSON.stringify(batchConfirmationPayload);
      let doesChange = false;
      dataChannel.onmessage = async (event) => {
        try {
          const { batchHash, isTotalBatchReceived, missingChunks } = JSON.parse(
            event.data
          );
          console.log("Confirmation: ", {
            isTotalBatchReceived,
            batchHash,
            missingChunks,
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
            console.log("Inside batch confirmation");
            console.log("Resending batch: ", resendChunkObj);
            console.log("Resending batch hash: ", batchHash);
            await sendBatchOfChunks(resendChunkObj, batchHash);
            dataChannel.send(batchConfirmationPayload);
            setTimeout(() => {
              if (!doesChange) {
                dataChannel.send(batchConfirmationPayload);
              }
            }, 3000);
            // resolve(true);
          } else {
            doesChange = true;
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
