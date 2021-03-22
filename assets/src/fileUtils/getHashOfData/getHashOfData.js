export const getHashOfData = (receivedData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const message = JSON.stringify(receivedData);
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
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
