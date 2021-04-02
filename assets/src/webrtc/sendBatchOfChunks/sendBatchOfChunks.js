import { alivaWebRTC } from "../index";

import { convertBlobToBase64 } from "../../fileUtils/convertBlobToBase64/convertBlobToBase64";

import { waitForChunkConfirmation } from "../waitForChunkConfirmation/waitForChunkConfirmation";

export const sendBatchOfChunks = async (
  fileName,
  batchOfChunksIDB,
  batchHash
) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(
        "fileName chunks :",
        fileName,
        alivaWebRTC.filesPeerConnections[fileName],
        Object.keys(batchOfChunksIDB).length
      );
      const allDataChannels =
        alivaWebRTC.filesPeerConnections[fileName].dataChannels;
      const dataChannelsKeys = Object.keys(allDataChannels);
      let dataChannelsHelper = 0;
      for (const chunkKey in batchOfChunksIDB) {
        if (Object.hasOwnProperty.call(batchOfChunksIDB, chunkKey)) {
          const [startSliceIndex, endSliceIndex] = chunkKey.split("__");
          const blobChunk = batchOfChunksIDB[chunkKey];
          const blobText = await convertBlobToBase64(blobChunk);
          const chunkToSend = {
            fileChunk: blobText,
            startSliceIndex,
            endSliceIndex,
          };
          if (dataChannelsHelper >= dataChannelsKeys.length) {
            dataChannelsHelper = 0;
          }
          const dcKey = dataChannelsKeys[dataChannelsHelper];
          const { dataChannel } = allDataChannels[dcKey];
          dataChannel.send(
            JSON.stringify({ isChunk: true, chunkToSend, batchHash })
          );
          const chunkConfirmationValue = await waitForChunkConfirmation(
            dataChannel,
            fileName,
            batchHash,
            startSliceIndex,
            endSliceIndex
          );
          console.log("chunkConfirmationValue", chunkConfirmationValue)
          dataChannelsHelper++;
        }
      }
      resolve(true);
    } catch (error) {
      debugger;
      reject(error);
    }
  });
};
