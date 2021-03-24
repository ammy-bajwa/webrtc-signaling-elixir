import { getBatchesMetadata } from "./getBatchesMetadata/getBatchesMetadata";

import { readAndSaveBatches } from "./readAndSaveBatches/readAndSaveBatches";

import { setStatus } from "../../../status/status";

import { saveFileMetadataInIndexedDB } from "../../../idbUtils/saveFileMetadataInIndexedDB/saveFileMetadataInIndexedDB";

import redux from "../../../utils/manageRedux";

export const uploadBatches = async (
  filesWithMetadata,
  numberOfChunksInSingleBatch
) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (
        let outerIndex = 0;
        outerIndex < filesWithMetadata.length;
        outerIndex++
      ) {
        const { fileName, fileSize, chunksArr, file } = filesWithMetadata[
          outerIndex
        ];
        const batchesMetaData = await getBatchesMetadata(
          fileName,
          fileSize,
          chunksArr,
          numberOfChunksInSingleBatch
        );
        // Here we will save files metadata to indexed db
        await saveFileMetadataInIndexedDB(fileName, fileSize, batchesMetaData);

        await readAndSaveBatches(file, batchesMetaData);

        setStatus(
          `<h2>
            ${file["name"]} has been saved successfully
          </h2>`
        );
        await redux.moveToidbState(file["name"]);
        console.log("uploadedfile:>>>>>>>>",file);
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
