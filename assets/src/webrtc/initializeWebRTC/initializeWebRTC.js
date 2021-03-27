import { v4 as uuidv4 } from "uuid";

import { alivaWebRTC } from "../index";

import { setStatus } from "../../status/status";

import { handleMetadataChannel } from "../handleMetadataChannel/handleMetadataChannel";

import { sendFile } from "../sendFile/sendFile";

import { checkIfAlreadyExist } from "../../idbUtils/checkIfAlreadyExist/checkIfAlreadyExist";

// import { getAllBatchKeys } from "../../idbUtils/getAllBatchKeys/getAllBatchKeys";

import { handleAllFileReceived } from "../../idbUtils/handleAllFileReceived/handleAllFileReceived";

import { allFileSendSignal } from "../allFileSendSignal/allFileSendSignal";

import { saveBatchBlobToIdb } from "../../idbUtils/saveBatchBlobToIdb/saveBatchBlobToIdb";

import { convertInMemoryBatchToBlob } from "../../fileUtils/convertInMemoryBatchToBlob/convertInMemoryBatchToBlob";

import { batchConfirmationMemory } from "../batchConfirmationMemory/batchConfirmationMemory";

import { causeDelay } from "../../utils/causeDelay";

import { getHashOfArraybuffer } from "../../fileUtils/getHashOfArraybuffer/getHashOfArraybuffer";

import { findInMemoryMissingBatchChunks } from "../../fileUtils/findInMemoryMissingBatchChunks/findInMemoryMissingBatchChunks";

import { getAllSavedFiles } from "../../idbUtils/getAllSavedFiles/getAllSavedFiles";

import redux from "../../utils/manageRedux";

import { iceServers } from "../iceServers/iceServers";

import { requestReceiverToSetupPC } from "../requestReceiverToSetupPC/requestReceiverToSetupPC";

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
            if (receivedMessage.isConfirmation) {
              const {
                batchHash,
                fileName,
                batchKey,
                endBatchIndex,
                fileSize,
              } = receivedMessage;
              console.log("Confirmation message: ", message);
              const inMemoryBatchChunks = alivaWebRTC.chunks[batchHash];
              if (inMemoryBatchChunks?.confirmation) {
                dataChannel.send(
                  JSON.stringify({
                    isTotalBatchReceived: true,
                    batchHash,
                    batchKey,
                    missingChunks: [],
                  })
                );
                return;
              } else {
                let missingChunks = [];
                let isTotalBatchReceived = await batchConfirmationMemory(
                  fileName,
                  batchHash,
                  batchKey
                );
                if (!isTotalBatchReceived) {
                  for (let index = 0; index <= 30; index++) {
                    await causeDelay(100);
                    isTotalBatchReceived = await batchConfirmationMemory(
                      fileName,
                      batchHash,
                      batchKey
                    );
                    if (isTotalBatchReceived) {
                      break;
                    }
                  }
                }
                if (isTotalBatchReceived) {
                  setStatus(`<h2>Validating batch ${batchKey}</h2>`);
                  const batchBlob = await convertInMemoryBatchToBlob(
                    inMemoryBatchChunks
                  );
                  const inMemoryBlobArrayBuffer = await batchBlob.arrayBuffer();
                  const inMemoryBlobHash = await getHashOfArraybuffer(
                    inMemoryBlobArrayBuffer
                  );
                  if (inMemoryBlobHash !== batchHash) {
                    isTotalBatchReceived = false;
                    // find missing chunks here
                    missingChunks = await findInMemoryMissingBatchChunks(
                      fileName,
                      batchKey,
                      batchHash,
                      inMemoryBatchChunks
                    );
                  } else {
                    setStatus(`<h2>Saving batch in idb<${batchKey}</h2>`);
                    missingChunks = await findInMemoryMissingBatchChunks(
                      fileName,
                      batchKey,
                      batchHash,
                      inMemoryBatchChunks
                    );
                    await saveBatchBlobToIdb(batchHash, batchBlob);
                    alivaWebRTC.chunks[batchHash] = { confirmation: true };
                    const status = `<h2>
      ${(endBatchIndex / 1000 / 1000).toFixed(
        2
      )} MB has been saved ${fileName} file out of ${(
                      fileSize /
                      1000 /
                      1000
                    ).toFixed(2)} MB 
        </h2>`;
                    setStatus(status);
                  }
                } else {
                  missingChunks = await findInMemoryMissingBatchChunks(
                    fileName,
                    batchKey,
                    batchHash,
                    inMemoryBatchChunks
                  );
                }
                if (missingChunks.length > 0) {
                  isTotalBatchReceived = false;
                }
                dataChannel.send(
                  JSON.stringify({
                    isTotalBatchReceived,
                    batchHash,
                    batchKey,
                    missingChunks,
                  })
                );
              }
            } else if (receivedMessage.isBatchExists) {
              const { batchHash } = receivedMessage;
              const isBatchExists = await checkIfAlreadyExist(batchHash);
              dataChannel.send(JSON.stringify({ isBatchExists }));
            } else if (receivedMessage.requestFile) {
              const { fileName } = receivedMessage;
              console.log("requestFile received second", fileName);
              await sendFile(fileName);
            } else if (receivedMessage.allFileSend) {
              const { fileName } = receivedMessage;
              await handleAllFileReceived(fileName);
              const files = await getAllSavedFiles();
              redux.storeState({ machineId, idbFiles: files });
              setStatus(`<h2>All File Received Successfully ${fileName}</h2>`);
              console.log("allFileSend received", fileName);
              dataChannel.send(JSON.stringify({ isReceived: true }));
            } else if (receivedMessage.setupPcRequest) {
              const { fileName } = receivedMessage;
              console.log("setupPcRequest received", fileName);
              await alivaWebRTC.setupFilePeerConnection(fileName);
              dataChannel.send(
                JSON.stringify({ setupPcRequest: true, fileName })
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
