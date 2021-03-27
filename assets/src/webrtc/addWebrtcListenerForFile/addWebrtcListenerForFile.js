export const addWebrtcListenerForFile = function (
  channel,
  machineId,
  peerConnection,
  fileName
) {
  return new Promise((resolve, reject) => {
    try {
      channel.on(`channel:onOfferFilePC`, async (data) => {
        const { offer, sender, fileName: receiverFileName } = data;
        if (sender !== machineId && fileName === receiverFileName) {
          console.log("SetRemote Offer");
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection.createAnswer();
          peerConnection.setLocalDescription(answer);
          channel.push("channel:sendAnswerFilePC", {
            sender: machineId,
            answer: answer,
            fileName,
          });
          console.log("Offer received: ", offer);
        }
      });

      channel.on(`channel:onAnswerFilePC`, async (data) => {
        const { answer, sender } = data;
        if (sender !== machineId) {
          console.log("SetRemote Answer");
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Answer received: ", answer);
        }
      });

      channel.on(`channel:onCandidateFilePC`, async (data) => {
        const { candidate, sender } = data;
        console.log("Candidate received: ", candidate);
        if (sender !== machineId) {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(JSON.parse(candidate))
          );
        }
      });
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
