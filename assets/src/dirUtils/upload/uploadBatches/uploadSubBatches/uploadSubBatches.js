import redux from "../../../../utils/manageRedux";

import { getBatchesMetadata } from "../getBatchesMetadata/getBatchesMetadata";

import { readAndSaveBatches } from "../readAndSaveBatches/readAndSaveBatches";

import { setStatus } from "../../../../status/status";

import { saveFileSubBatchesMetadataInIndexedDB } from "../../../../idbUtils/saveFileSubBatchesMetadataInIndexedDB/saveFileSubBatchesMetadataInIndexedDB";

import { alivaWebRTC } from "../../../../webrtc";
import { populateSubBatchesWithData } from "../populateSubBatchesWithData/populateSubBatchesWithData";

export const uploadSubBatches = async (filesWithMetadata) => {
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
        const subBatchesMetaData = await getBatchesMetadata(
          fileName,
          fileSize,
          chunksArr,
          alivaWebRTC.chunkCountInSingleSubBatch
        );
        // Here we will save files metadata to indexed db
        console.log("subBatchesMetaData: ", subBatchesMetaData);

        await saveFileSubBatchesMetadataInIndexedDB(
          fileName,
          subBatchesMetaData
        );

        const populatedSubBatches = await populateSubBatchesWithData(
          file,
          subBatchesMetaData
        );

        setStatus(
          `<h2>
            ${file["name"]} has been saved successfully
          </h2>`
        );
        console.log("uploadedfile:>>>>>>>>", file);
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
