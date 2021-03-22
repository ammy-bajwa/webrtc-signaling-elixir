export const getBatchIndexes = async (
  chunksArr,
  baseChunksCounterForBatchHelper,
  numberOfChunksInSingleBatch
) => {
  const getBatchIndexesPromise = new Promise((resolve, reject) => {
    try {
      let batchIndexObj = {};
      for (
        let index = baseChunksCounterForBatchHelper;
        index < numberOfChunksInSingleBatch;
        index++
      ) {
        const chunkMetadata = chunksArr[index];
        if (chunkMetadata) {
          const { startSliceIndex, endSliceIndex } = chunkMetadata;
          batchIndexObj[`${startSliceIndex}__${endSliceIndex}`] = chunkMetadata;
        } else {
          console.log("Chunk ended");
          break;
        }
      }
      resolve(batchIndexObj);
    } catch (error) {
      reject(error);
    }
  });
  return await getBatchIndexesPromise;
};
