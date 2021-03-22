import { v4 as uuidv4 } from "uuid";

import { alivaWebRTC } from "../index";

import { setStatus } from "../../status/status";

import { handleMetadataChannel } from "../handleMetadataChannel/handleMetadataChannel";

// import { handleReceivedChunk } from "../../idbUtils/handleReceivedChunk/handleReceivedChunk";

// import { doConfirmationForBatch } from "../../idbUtils/doConfirmationForBatch/doConfirmationForBatch";

import { checkIfAlreadyExist } from "../../idbUtils/checkIfAlreadyExist/checkIfAlreadyExist";

// import { getAllBatchKeys } from "../../idbUtils/getAllBatchKeys/getAllBatchKeys";

import { saveBatchBlobToIdb } from "../../idbUtils/saveBatchBlobToIdb/saveBatchBlobToIdb";

import { convertInMemoryBatchToBlob } from "../../fileUtils/convertInMemoryBatchToBlob/convertInMemoryBatchToBlob";

import { batchConfirmationMemory } from "../batchConfirmationMemory/batchConfirmationMemory";

import { causeDelay } from "../../utils/causeDelay";

import { getHashOfArraybuffer } from "../../fileUtils/getHashOfArraybuffer/getHashOfArraybuffer";

import { findInMemoryMissingBatchChunks } from "../../fileUtils/findInMemoryMissingBatchChunks/findInMemoryMissingBatchChunks";

const iceServers = [
  {
    urls: ["stun:avm4962.com:3478", "stun:avm4962.com:5349"],
  },
  { urls: ["stun:ss-turn1.xirsys.com"] },
  {
    username: "TuR9Us3r",
    credential:
      "T!W779M?Vh#5ewJcT=L4v6NcUE*=4+-*fcy+gLAS$^WJgg+wq%?ca^Br@D%Q2MVpyV2sqTcHmUAdP2z4#=S8FAb*3LKGT%W^4R%h5Tdw%D*zvvdWTzSA@ytvEH!G#^99QmW3*5ps^jv@aLdNSfyYKBUS@CJ#hxSp5PRnzP+_YDcJHN&ng2Q_g6Z!+j_3RD%vc@P4g%tFuAuX_dz_+AQNe$$$%w7A4sW?CDr87ca^rjFBGV??JR$!tCSnZdAJa6P8",
    urls: [
      "turn:avm4962.com:3478?transport=udp",
      "turn:avm4962.com:5349?transport=tcp",
    ],
  },
  {
    username:
      "ZyUlEkJOyQDmJFZ0nkKcAKmrrNayVm-rutt8RNHa1EQe_NQADY6Rk4sM2zVstYo_AAAAAF9xt7VhbGl2YXRlY2g=",
    credential: "820f7cf4-0173-11eb-ad8b-0242ac140004",
    urls: [
      "turn:ss-turn1.xirsys.com:80?transport=udp",
      "turn:ss-turn1.xirsys.com:3478?transport=udp",
      "turn:ss-turn1.xirsys.com:80?transport=tcp",
      "turn:ss-turn1.xirsys.com:3478?transport=tcp",
      "turns:ss-turn1.xirsys.com:443?transport=tcp",
      "turns:ss-turn1.xirsys.com:5349?transport=tcp",
    ],
  },
];

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
          // console.log("Got message: ", message);
          console.log("Got message");
          try {
            const receivedMessage = JSON.parse(message);
            if (receivedMessage.isChunk) {
              await alivaWebRTC.saveChunkInMemory(
                receivedMessage.batchHash,
                receivedMessage.chunkToSend
              );
              return;
            } else if (receivedMessage.isConfirmation) {
              const { batchHash, fileName, batchKey } = receivedMessage;
              console.log("Confirmation message: ", message);
              const inMemoryBatchChunks = alivaWebRTC.chunks[batchHash];
              if (inMemoryBatchChunks.confirmation) {
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
                    missingChunks = await findInMemoryMissingBatchChunks(
                      fileName,
                      batchKey,
                      batchHash,
                      inMemoryBatchChunks
                    );
                    await saveBatchBlobToIdb(batchHash, batchBlob);
                    alivaWebRTC.chunks[batchHash] = { confirmation: true };
                  }
                } else {
                  missingChunks = await findInMemoryMissingBatchChunks(
                    fileName,
                    batchKey,
                    batchHash,
                    inMemoryBatchChunks
                  );
                }
                console.log("missingBatchChunks: actual", missingChunks);
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
