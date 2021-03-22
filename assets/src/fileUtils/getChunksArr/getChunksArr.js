export const getChunksArr = async (fileSize, chunkSize) => {
  const getChunksArrPromise = new Promise((resolve, reject) => {
    try {
      const numberOfArrayChunks = Math.floor(fileSize / chunkSize);
      const totalBaseChunksSize = numberOfArrayChunks * chunkSize;
      const lastChunkIndex = fileSize - totalBaseChunksSize;
      let startSliceIndex = 0,
        endSliceIndex = chunkSize,
        chunksArr = [];
      for (let index = 0; index < numberOfArrayChunks; index++) {
        const chunkInfo = {
          startSliceIndex,
          endSliceIndex,
        };
        chunksArr.push(chunkInfo);
        startSliceIndex = endSliceIndex;
        endSliceIndex += chunkSize;
      }
      const lastChunkObj = {
        startSliceIndex: startSliceIndex,
        endSliceIndex: startSliceIndex + lastChunkIndex,
      };
      chunksArr.push(lastChunkObj);
      resolve(chunksArr);
    } catch (error) {
      reject(error);
    }
  });
  return await getChunksArrPromise;
};
