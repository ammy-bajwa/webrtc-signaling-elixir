export const convertInMemoryBatchToBlob = function (inMemoryBatch) {
  return new Promise(async (resolve, reject) => {
    try {
      const base64Type = "data:application/octet-stream;base64,";
      let chunkBlobArr = [];
      let chunksKeys = Object.keys(inMemoryBatch);
      chunksKeys.sort((a, b) => {
        return parseInt(a.split("__")[0]) - parseInt(b.split("__")[0]);
      });
      for (let index = 0; index < chunksKeys.length; index++) {
        const chunkKey = chunksKeys[index];
        const { fileChunk } = inMemoryBatch[chunkKey];
        let chunkBase64 = fileChunk.split(base64Type)[1];
        const byteCharacters = atob(chunkBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const chunkBlob = new Blob([byteArray], {
          type: "application/octet-stream",
        });
        chunkBlobArr.push(chunkBlob);
      }
      const batchBlob = new Blob(chunkBlobArr, {
        type: "application/octet-stream",
      });
      resolve(batchBlob);
    } catch (error) {
      reject(error);
    }
  });
};
