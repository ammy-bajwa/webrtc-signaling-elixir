export const convertBlobToBase64 = function (myBlob) {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", async (event) => {
        const fileChunk = event.target.result;
        resolve(fileChunk);
      });
      // Base64
      fileReader.readAsDataURL(myBlob);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
