import { getBatchIndexes } from "../getBatchIndexes/getBatchIndexes";

export const getBatchesMetadata = async (
  fileName,
  fileSize,
  chunksArr,
  numberOfChunksInSingleBatch
) => {
  const getBatchesMetadataPromise = new Promise(async (resolve, reject) => {
    const totalChunksLength = chunksArr.length;
    const totalBatchesCount = Math.ceil(
      totalChunksLength / numberOfChunksInSingleBatch
    );
    let startBatchCounter = 0;
    let endBatchCounter = numberOfChunksInSingleBatch;
    let batchesMetadata = {};
    for (let index = 0; index < totalBatchesCount; index++) {
      let batchObj = {};
      const batchChunksObj = await getBatchIndexes(
        chunksArr,
        startBatchCounter,
        endBatchCounter
      );
      const batchChunksKeys = Object.keys(batchChunksObj);
      batchObj.totalChunksCount = batchChunksKeys.length;
      batchObj.fileName = fileName;
      const startIndex = `${batchChunksKeys[0].split("__")[0]}`;
      batchObj.startBatchIndex = parseInt(startIndex);
      const lastIndexKey = `${
        batchChunksKeys[batchChunksKeys.length - 1].split("__")[1]
      }`;
      batchObj.endBatchIndex = parseInt(lastIndexKey);
      batchesMetadata[`batch__${index}`] = batchObj;

      startBatchCounter = endBatchCounter;
      endBatchCounter = endBatchCounter + numberOfChunksInSingleBatch;
    }
    resolve(batchesMetadata);
  });

  return await getBatchesMetadataPromise;
};
