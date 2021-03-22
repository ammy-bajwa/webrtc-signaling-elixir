import { alivaWebRTC } from "../index";

import { sendBatchOfChunks } from "../sendBatchOfChunks/sendBatchOfChunks";

export const waitForBatchConfirmation = (
  fileName,
  batchKey,
  batchHash,
  batchOfChunksIDB
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataChannel =
        alivaWebRTC.dataChannels["batchConfirmation"]?.dataChannel;
      if (!dataChannel) {
        dataChannel = await alivaWebRTC.createDataChannel("batchConfirmation");
      }
      console.log("Inside batch confirmation");
      let batchConfirmationPayload = {
        isConfirmation: true,
        batchKey,
        batchHash,
        fileName,
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
              resendChunkObj[chunkKey] = batchOfChunksIDB[chunkKey];
            }
            await sendBatchOfChunks(resendChunkObj, batchHash);
            console.log("Resending batch: ", resendChunkObj);
            console.log("Resending batch hash: ", batchHash);
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
