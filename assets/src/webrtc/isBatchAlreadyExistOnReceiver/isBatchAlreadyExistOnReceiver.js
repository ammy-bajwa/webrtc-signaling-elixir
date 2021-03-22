import { alivaWebRTC } from "../index";

export const isBatchAlreadyExistOnReceiver = (batchHash) => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataChannel =
        alivaWebRTC.dataChannels["batchConfirmation"]?.dataChannel;
      if (!dataChannel) {
        dataChannel = await alivaWebRTC.createDataChannel("batchConfirmation");
      }
      dataChannel.onmessage = (event) => {
        const { isBatchExists } = JSON.parse(event.data);
        resolve(isBatchExists);
        console.log("isBatchExists: ", isBatchExists);
      };
      let batchExistsRequest = {
        isBatchExists: true,
        batchHash,
      };
      batchExistsRequest = JSON.stringify(batchExistsRequest);
      dataChannel.send(batchExistsRequest);
    } catch (error) {
      reject(error);
    }
  });
};
