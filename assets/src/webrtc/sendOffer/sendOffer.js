export const sendOffer = function (channel, machineId) {
  return new Promise(async (resolve, reject) => {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      channel.push("channel:sendOffer", {
        sender: machineId,
        offer,
      });
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
