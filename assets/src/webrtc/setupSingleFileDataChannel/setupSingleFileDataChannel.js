export const setupSingleFileDataChannel = function (dataChannel) {
  return new Promise(async (resolve, reject) => {
    try {
      dataChannel.onopen = () => {
        const { label } = dataChannel;
        console.log("File datachannel open");
        resolve(true);
      };

      dataChannel.onerror = function (error) {
        // console.log("dc close");
      };

      dataChannel.onmessage = async (event) => {
        const message = event.data;
        console.log("File DC Has Message: ", message);
      };
    } catch (error) {
      reject(error);
    }
  });
};
