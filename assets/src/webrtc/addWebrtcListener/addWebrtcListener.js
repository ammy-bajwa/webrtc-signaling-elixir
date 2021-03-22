export const addWebrtcListener = function (channel, machineId, peerConnection) {
  return new Promise((resolve, reject) => {
    try {
      channel.on(`channel:onOffer`, async (data) => {
        const { offer, sender } = data;
        if (sender !== machineId) {
          console.log("SetRemote Offer");
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection.createAnswer();
          peerConnection.setLocalDescription(answer);
          channel.push("channel:sendAnswer", {
            sender: machineId,
            answer: answer,
          });
          console.log("Offer received: ", offer);
        }
      });

      channel.on(`channel:onAnswer`, async (data) => {
        const { answer, sender } = data;
        if (sender !== machineId) {
          console.log("SetRemote Answer");
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log("Answer received: ", answer);
        }
      });

      channel.on(`channel:onCandidate`, async (data) => {
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
