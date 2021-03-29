import { alivaWebRTC } from "../index";

export const allFileSendSignal = function (fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      let dataChannel =
        alivaWebRTC.filesPeerConnections[fileName].dataChannels["shareInfo_0"]
          .dataChannel;
      const allFileSendSignal = {
        allFileSend: true,
        fileName,
      };
      dataChannel.send(JSON.stringify(allFileSendSignal));
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
