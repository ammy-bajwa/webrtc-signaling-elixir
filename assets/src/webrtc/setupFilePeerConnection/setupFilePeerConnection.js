import { alivaWS } from "../../socket/index";

import { iceServers } from "../iceServers/iceServers";

import { alivaWebRTC } from "../index";

import store from "../../redux/store";

import { addWebrtcListenerForFile } from "../addWebrtcListenerForFile/addWebrtcListenerForFile";

import { handleBatchConfirmation } from "../handleBatchConfirmation/handleBatchConfirmation";

import { handleAllFileReceived } from "../../idbUtils/handleAllFileReceived/handleAllFileReceived";

import { getAllSavedFiles } from "../../idbUtils/getAllSavedFiles/getAllSavedFiles";

import { setStatus } from "../../status/status";

import redux from "../../utils/manageRedux";

export const setupFilePeerConnection = function (fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        fileReducer: { machineId },
      } = store.getState();

      const peerConnection = new RTCPeerConnection(iceServers);
      this.filesPeerConnections[fileName] = {
        peerConnection,
        dataChannels: {},
      };

      const { channel } = alivaWS;
      await addWebrtcListenerForFile(
        channel,
        machineId,
        peerConnection,
        fileName
      );

      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        const { label } = dataChannel;
        dataChannel.onopen = () => {
          // console.log("File datachannel open: ");
          const dataChannelObj = {
            dataChannel,
          };
          this.filesPeerConnections[fileName].dataChannels[
            label
          ] = dataChannelObj;
        };

        dataChannel.onerror = function (error) {
          // console.log("dc close");
        };

        dataChannel.onmessage = async (event) => {
          const message = event.data;
          try {
            console.log("message received fileDC: ");
            const receivedMessage = JSON.parse(message);
            if (receivedMessage.isConfirmation) {
              console.log("isConfirmation: ", receivedMessage);
              await handleBatchConfirmation(dataChannel, receivedMessage);
            } else if (receivedMessage.allFileSend) {
              await handleAllFileReceived(fileName);
              const files = await getAllSavedFiles();
              redux.storeState({ machineId, idbFiles: files });
              setStatus(`<h2>All File Received Successfully ${fileName}</h2>`);
              console.log("allFileSend received", fileName, dataChannel.label);
            } else if (receivedMessage.isChunk) {
              await alivaWebRTC.saveChunkInMemory(
                fileName,
                receivedMessage.batchHash,
                receivedMessage.chunkToSend
              );
            }
          } catch (error) {
            console.error(error);
          }
        };
      };
      peerConnection.onnegotiationneeded = async () => {
        console.log("On negotiation called");
        const offer = await peerConnection.createOffer();
        peerConnection.setLocalDescription(offer);
        channel.push("channel:sendOfferFilePC", {
          sender: machineId,
          offer: offer,
          fileName,
        });
        console.log("Offer sended");
      };

      peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
          channel.push(`channel:sendIceFilePC`, {
            candidate: JSON.stringify(event.candidate),
            sender: machineId,
            fileName,
          });
        }
      };
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
