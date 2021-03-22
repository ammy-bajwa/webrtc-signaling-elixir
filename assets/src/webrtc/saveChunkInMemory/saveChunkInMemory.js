export const saveChunkInMemory = function (batchHash, chunk) {
  return new Promise((resolve, reject) => {
    try {
      const { startSliceIndex, endSliceIndex } = chunk;
      let batchInMemory = this.chunks[`${batchHash}`];
      if (!batchInMemory) {
        this.chunks[`${batchHash}`] = {};
      }
      let chunkInMemory = this.chunks[`${batchHash}`][
        `${startSliceIndex}__${endSliceIndex}`
      ];
      if (!chunkInMemory) {
        this.chunks[`${batchHash}`][
          `${startSliceIndex}__${endSliceIndex}`
        ] = {};
      }
      this.chunks[`${batchHash}`][
        `${startSliceIndex}__${endSliceIndex}`
      ] = chunk;
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
