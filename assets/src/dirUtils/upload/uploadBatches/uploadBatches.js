import { getBatchesMetadata } from "./getBatchesMetadata/getBatchesMetadata";

import { readAndSaveBatches } from "./readAndSaveBatches/readAndSaveBatches";

import { setStatus } from "../../../status/status";

import { saveFileMetadataInIndexedDB } from "../../../idbUtils/saveFileMetadataInIndexedDB/saveFileMetadataInIndexedDB";

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
        console.log("batchesMetaData: ", batchesMetaData);
        // Here we will save files metadata to indexed db
        await saveFileMetadataInIndexedDB(fileName, fileSize, batchesMetaData);

        await readAndSaveBatches(file, batchesMetaData);

        setStatus(
          `<h2>
            ${file["name"]} has been saved successfully
      </h2>`
        );
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
