export const sendFilesMetadata = function (idbFiles, alivaWebRTC) {
  return new Promise(async (resolve, reject) => {
    let dataChannel =
      alivaWebRTC.dataChannels["metadataDataChannel"]?.dataChannel;
    if (!dataChannel) {
      dataChannel = await alivaWebRTC.createDataChannel("metadataDataChannel");
    }
    for (let index = 0; index < idbFiles.length; index++) {
      const { name, size, batchesMetaData, fileHash } = idbFiles[index];
      console.log("Idb Files: ", idbFiles[index]);
      if (size < 5000000) {
        dataChannel.send(
          JSON.stringify({
            name,
            size,
            batchesMetaData,
            isAll: true,
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
              isAll: false,
              fileHash,
            })
          );
          await awaitConfirmation(dataChannel);
        }
        // const subBatchKeys = Object.keys(subBatchesMetaData);
        // for (let index = 0; index < subBatchKeys.length; index++) {
        //   const batchKey = subBatchKeys[index];
        //   const subBatchInfo = {};
        //   subBatchInfo[batchKey] = subBatchesMetaData[batchKey];
        //   dataChannel.send(
        //     JSON.stringify({
        //       name,
        //       size,
        //       subBatchesMetaData: subBatchInfo,
        //       isReceived: true,
        //       isAll: false,
        //       fileHash,
        //     })
        //   );
        //   await awaitConfirmation(dataChannel);
        // }
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
