import { alivaWebRTC } from "../index";

export const requestReceiverToSetupPC = function (fileNameToSend) {
  return new Promise(async (resolve, reject) => {
    try {
      const dataChannel = alivaWebRTC.dataChannels["dc"].dataChannel;
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
