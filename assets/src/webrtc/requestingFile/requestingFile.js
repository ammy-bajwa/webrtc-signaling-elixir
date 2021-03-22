import { alivaWebRTC } from "../index";

export const requestingFile = async (fileName) => {
  const { dataChannel } = alivaWebRTC["dataChannels"]["dc"];
  let requestingFileObj = {
    requestFile: true,
    fileName,
  };
  requestingFileObj = JSON.stringify(requestingFileObj);
  dataChannel.send(requestingFileObj);
};