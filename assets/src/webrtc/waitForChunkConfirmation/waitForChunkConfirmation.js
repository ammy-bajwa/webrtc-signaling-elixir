import { alivaWebRTC } from "../index";

import { sendBatchOfChunks } from "../sendBatchOfChunks/sendBatchOfChunks";

export const waitForChunkConfirmation = (
  dataChannel,
  fileName,
  sendedBatchHash,
  sendedStartChunkIndex,
  sendedEndChunkIndex
) => {
  return new Promise(async (resolve, reject) => {
    try {
      dataChannel.onmessage = (event) => {
        const receivedMessage = JSON.parse(event.data);
        const { batchHash, startSliceIndex, endSliceIndex } = receivedMessage;
        if (
          batchHash === sendedBatchHash &&
          startSliceIndex === sendedStartChunkIndex &&
          endSliceIndex === sendedEndChunkIndex
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
    } catch (error) {
      reject(error);
    }
  });
};
