import { v4 as uuidv4 } from "uuid";

import { setStatus } from "../../status/status";

import { sendFile } from "../sendFile/sendFile";

export const createDataChannel = function (dataChannelName) {
  return new Promise(async (resolve, reject) => {
    const dcOptions = {
      ordered: true,
      maxRetransmits: 10,
    };
    let dataChannel = this.dataChannels[dataChannelName];
    if (!dataChannel) {
      dataChannel = await this.peerConnection.createDataChannel(
        dataChannelName,
        dcOptions
      );
    }
    const webrtcObj = this;
    dataChannel.onopen = () => {
      console.log("datachannel is open");
      const dataChannelObj = {
        id: uuidv4(),
        dataChannel,
      };
      setStatus(`<h2>Webrtc connected</h2>`);
      webrtcObj.dataChannels[dataChannelName] = dataChannelObj;
      resolve(dataChannel);
    };

    dataChannel.onerror = function (error) {
      console.log("Error:", error);
      reject(error);
      delete webrtcObj.dataChannels[dataChannelName];
      setStatus("<h2>Webrtc disconnected</h2>");
    };

    dataChannel.onmessage = async (event) => {
      // console.log("Got message", event.data);
      console.log("Got message");
      try {
        let receivedMessage = JSON.parse(event.data);
        if (receivedMessage.requestFile) {
          const { fileName } = receivedMessage;
          console.log("requestFile received", fileName);
          await sendFile(fileName);
        }
      } catch (error) {
        console.error(error);
      }
    };
  });
};
