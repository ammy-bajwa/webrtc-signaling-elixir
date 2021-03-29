import { v4 as uuidv4 } from "uuid";

import { alivaWebRTC } from "../index";

import { setStatus } from "../../status/status";

import { handleMetadataChannel } from "../handleMetadataChannel/handleMetadataChannel";

import { sendFile } from "../sendFile/sendFile";

import { checkIfAlreadyExist } from "../../idbUtils/checkIfAlreadyExist/checkIfAlreadyExist";

import { handleAllFileReceived } from "../../idbUtils/handleAllFileReceived/handleAllFileReceived";

import { getAllSavedFiles } from "../../idbUtils/getAllSavedFiles/getAllSavedFiles";

import redux from "../../utils/manageRedux";

import { iceServers } from "../iceServers/iceServers";

export const initializeWebRTC = function (channel, machineId) {
  return new Promise((resolve, reject) => {
    try {
      const peerConnection = new RTCPeerConnection(iceServers);
      this.peerConnection = peerConnection;
      const webrtcObj = this;
      peerConnection.onnegotiationneeded = async () => {
        console.log("On negotiation called");
        const offer = await peerConnection.createOffer();
        peerConnection.setLocalDescription(offer);
        channel.push("channel:sendOffer", {
          sender: machineId,
          offer: offer,
        });
        console.log("Offer sended");
      };

      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        const { label } = dataChannel;
        if (label === "metadataDataChannel") {
          handleMetadataChannel(dataChannel);
          return;
        }
        dataChannel.onopen = () => {
          console.log("On datachannel open");
          const dataChannelObj = {
            id: uuidv4(),
            dataChannel,
          };
          setStatus("<h2>Webrtc connected</h2>");
          webrtcObj.dataChannels[label] = dataChannelObj;
        };

        dataChannel.onerror = function (error) {
          console.log("Error:", error);
          setStatus("<h2>Webrtc disconnected</h2>");
        };

        dataChannel.onmessage = async (event) => {
          const message = event.data;
          console.log("Got message: ", JSON.parse(message));
          // console.log("Got message");
          try {
            const receivedMessage = JSON.parse(message);
            if (receivedMessage.isBatchExists) {
              const { batchHash } = receivedMessage;
              const isBatchExists = await checkIfAlreadyExist(batchHash);
              dataChannel.send(JSON.stringify({ isBatchExists }));
            } else if (receivedMessage.requestFile) {
              const { fileName } = receivedMessage;
              console.log("requestFile received second", fileName);
              await sendFile(fileName);
            } else if (receivedMessage.setupPcRequest) {
              const { fileName } = receivedMessage;
              console.log("setupPcRequest received", fileName);
              await alivaWebRTC.setupFilePeerConnection(fileName);
              dataChannel.send(
                JSON.stringify({ pcSetupConfirmation: true, fileName })
              );
            }
          } catch (error) {
            console.log("Got message on error: ", message);
            console.error(error);
          }
        };
      };

      peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
          channel.push(`channel:sendIce`, {
            candidate: JSON.stringify(event.candidate),
            sender: machineId,
          });
        }
      };
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
