import { getSpecificFileChunk } from "../../../../fileUtils/getSpecificFileChunk/getSpecificFileChunk";

export const addFileDataToChunks = async (
  file,
  startBatchIndex,
  endBatchIndex
) => {
  const addFileDataToChunksPromise = new Promise(async (resolve, reject) => {
    try {
      // const batchWithFileChunks = {};
      const fileChunkObj = await getSpecificFileChunk(
        file,
        startBatchIndex,
        endBatchIndex
      );
      resolve(fileChunkObj);
    } catch (error) {
      reject(error);
    }
  });
  return await addFileDataToChunksPromise;
};
