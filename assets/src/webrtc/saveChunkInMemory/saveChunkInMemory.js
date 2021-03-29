import { setStatus } from "../../status/status";

export const saveChunkInMemory = function (fileName, batchHash, chunk) {
  return new Promise((resolve, reject) => {
    try {
      const { startSliceIndex, endSliceIndex } = chunk;
      let fileChunks = this.chunks[fileName];
      if (!fileChunks) {
        this.chunks[fileName] = {};
      }
      let batchInMemory = this.chunks[fileName][`${batchHash}`];
      if (!batchInMemory) {
        this.chunks[fileName][`${batchHash}`] = {};
      }
      let chunkInMemory = this.chunks[fileName][`${batchHash}`][
        `${startSliceIndex}__${endSliceIndex}`
      ];
      if (!chunkInMemory) {
        this.chunks[fileName][`${batchHash}`][
          `${startSliceIndex}__${endSliceIndex}`
        ] = {};
      }
      this.chunks[fileName][`${batchHash}`][
        `${startSliceIndex}__${endSliceIndex}`
      ] = chunk;
      setStatus(`<h2>File chunks saving in memory...</h2>`);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
