// import { checkIfAlreadyExist } from "../../idbUtils/checkIfAlreadyExist/checkIfAlreadyExist";

import { saveReceivedMetadata } from "../../idbUtils/saveReceivedMetadata/saveReceivedMetadata";

import { createBatchesDbs } from "../../idbUtils/createBatchesDbs/createBatchesDbs";

import redux from "../../utils/manageRedux";

export const handleMetadataChannel = function (dataChannel) {
  dataChannel.onopen = () => {
    console.log("On metadata datachannel open");
  };

  dataChannel.onerror = function (error) {
    console.log("Error:", error);
  };

  dataChannel.onmessage = async (event) => {
    const message = event.data;
    console.log("metadata message: ", message);
    try {
      const parsedMessage = JSON.parse(message);
      const {
        name,
        size,
        batchesMetaData,
        isReceived,
        fileHash,
      } = parsedMessage;
      redux.saveReceivedMetadataInState({
        name,
        size,
        batchesMetaData,
        fileHash,
        isReceived,
        isOnlyMetadata: true
      });
      await saveReceivedMetadata(name, size, batchesMetaData, fileHash);
      await createBatchesDbs(batchesMetaData);
      dataChannel.send(
        JSON.stringify({
          received: true,
        })
      );
    } catch (error) {
      console.error(error);
    }
    // We will parse the received message
    // extract fileName
    // Get metadata if already exist
    // Adding received metadata to received and save
  };
};
