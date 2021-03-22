export const getHashOfArraybuffer = (arrayBufferOfBlob) => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        arrayBufferOfBlob
      );
      // hash the message
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      resolve(hashHex);
    } catch (error) {
      reject(error);
    }
  });
};
