import { alivaWebRTC } from "../index";

export const requestReceiverToSetupPC = function (fileNameToSend) {
  return new Promise(async (resolve, reject) => {
    try {
      const dcKeys = Object.keys(alivaWebRTC.dataChannels);
      const dataChannel = alivaWebRTC.dataChannels[dcKeys[0]].dataChannel;
      const setupFilePcRequest = {
        setupPcRequest: true,
        fileName: fileNameToSend,
      };
      dataChannel.send(JSON.stringify(setupFilePcRequest));
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
