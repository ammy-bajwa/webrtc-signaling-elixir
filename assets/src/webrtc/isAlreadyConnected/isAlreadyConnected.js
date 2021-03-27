import { alivaWebRTC } from "../index";

export const isAlreadyConnected = function (fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const pc = alivaWebRTC.filesPeerConnections[fileName]?.peerConnection;
      const pcState = pc?.connectionState;
      if (pcState !== "connected") {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (error) {
      reject(error);
    }
  });
};
