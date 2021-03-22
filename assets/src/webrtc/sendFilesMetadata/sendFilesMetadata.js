export const sendFilesMetadata = function (idbFiles, alivaWebRTC) {
  return new Promise(async (resolve, reject) => {
    const dataChannel = await alivaWebRTC.createDataChannel(
      "metadataDataChannel"
    );
    for (let index = 0; index < idbFiles.length; index++) {
      const { name, size, batchesMetaData, fileHash } = idbFiles[index];
      if (size < 10000000) {
        dataChannel.send(
          JSON.stringify({
            name,
            size,
            batchesMetaData,
            isReceived: true,
            fileHash,
          })
        );
      } else {
        const batchKeys = Object.keys(batchesMetaData);
        for (let index = 0; index < batchKeys.length; index++) {
          const batchKey = batchKeys[index];
          const batchInfo = {};
          batchInfo[batchKey] = batchesMetaData[batchKey];
          dataChannel.send(
            JSON.stringify({
              name,
              size,
              batchesMetaData: batchInfo,
              isReceived: true,
              fileHash,
            })
          );
          await awaitConfirmation(dataChannel);
        }
      }
    }
    resolve(true);
  });
};

const awaitConfirmation = (dc) => {
  return new Promise((resolve, reject) => {
    dc.onmessage = (event) => {
      const message = event.data;
      try {
        const { received } = JSON.parse(message);
        if (received) {
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    };
  });
};
