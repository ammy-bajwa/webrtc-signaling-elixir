import { alivaWebRTC } from "../index";

import { convertBlobToBase64 } from "../../fileUtils/convertBlobToBase64/convertBlobToBase64";

export const sendBatchOfChunks = async (batchOfChunksIDB, batchHash) => {
  return new Promise(async (resolve, reject) => {
    try {
      const allDataChannels = alivaWebRTC.dataChannels;
      const dataChannelsKeys = Object.keys(alivaWebRTC.dataChannels);
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
          dataChannelsHelper++;
        }
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
