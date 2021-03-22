export const getSpecificFileChunk = async (
  file,
  startSliceIndex,
  endSliceIndex
) => {
  const fileChunkPromise = new Promise(async (resolve, reject) => {
    try {
      const slicedFileBlob = file.slice(startSliceIndex, endSliceIndex);
      // const fileReader = new FileReader();
      // fileReader.addEventListener("load", async (event) => {
      //   const fileChunk = {
      //     fileChunk: event.target.result,
      //     startSliceIndex,
      //     endSliceIndex,
      //   };
      //   resolve(fileChunk);
      // });
      // Base64
      // fileReader.readAsDataURL(slicedFileBlob);
      resolve(slicedFileBlob);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
  return await fileChunkPromise;
};
