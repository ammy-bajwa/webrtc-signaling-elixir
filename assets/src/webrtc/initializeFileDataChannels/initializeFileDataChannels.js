export const initializeFileDataChannels = function (fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const peerConnection = this.filesPeerConnections[fileName].peerConnection;
      let fileDataChannels = {};
      let isDcAlreadyExists = this.filesPeerConnections[fileName].dataChannel;
      if (isDcAlreadyExists) {
        resolve(true);
      } else {
        for (let index = 0; index <= 100; index++) {
          const dataChannelName = `dc_${index}`;
          const dataChannel = await peerConnection.createDataChannel(
            dataChannelName
          );
          await this.setupSingleFileDataChannel(dataChannel);
          fileDataChannels[dataChannelName] = { dataChannel };
        }

        for (let index = 0; index <= 1; index++) {
          const dataChannelName = `shareInfo_${index}`;
          const dataChannel = await peerConnection.createDataChannel(
            dataChannelName
          );
          await this.setupSingleFileDataChannel(dataChannel);
          fileDataChannels[dataChannelName] = { dataChannel };
        }

        this.filesPeerConnections[fileName].dataChannels = fileDataChannels;
        resolve(true);
      }
    } catch (error) {
      reject(error);
    }
  });
};
