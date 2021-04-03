import { alivaWebRTC } from "../index";

export const isBatchAlreadyExistOnReceiver = (fileName, batchHash) => {
  return new Promise(async (resolve, reject) => {
    try {
      const peerConnection =
        alivaWebRTC.filesPeerConnections[fileName].peerConnection;
      const dataChannel = await peerConnection.createDataChannel(
        `isAlreadyExists_${batchHash}`
      );

      dataChannel.onmessage = (event) => {
        const { isBatchExists } = JSON.parse(event.data);
        resolve(isBatchExists);
        dataChannel.close();
        console.log("isBatchExists: ", isBatchExists);
      };
      let batchExistsRequest = {
        isBatchExists: true,
        batchHash,
      };
      batchExistsRequest = JSON.stringify(batchExistsRequest);

      dataChannel.onopen = () => {
        dataChannel.send(batchExistsRequest);
      };
    } catch (error) {
      reject(error);
    }
  });
};
