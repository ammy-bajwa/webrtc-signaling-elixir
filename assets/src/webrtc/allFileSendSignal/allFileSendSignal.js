import { alivaWebRTC } from "../index";

export const allFileSendSignal = function (fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const peerConnection =
        alivaWebRTC.filesPeerConnections[fileName].peerConnection;
      const dataChannel = await peerConnection.createDataChannel("allFileSend");
      const allFileSendSignal = {
        allFileSend: true,
        fileName,
      };
      dataChannel.onopen = () => {
        console.log("allFile DC Open");
        dataChannel.send(JSON.stringify(allFileSendSignal));
        resolve(true);
      };
    } catch (error) {
      reject(error);
    }
  });
};
