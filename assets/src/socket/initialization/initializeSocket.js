import { Socket } from "phoenix";

export const initializeSocket = function (wsAddress) {
  const wsThis = this;
  return new Promise(function (resolve, reject) {
    const socket = new Socket(wsAddress);
    socket.connect();

    socket.onOpen = function () {
      console.log("Socket is open");
      wsThis.socket = socket;
    };
    // Now that you are connected, you can join channels with a topic:
    let channel = socket.channel("channel:signal", {});
    channel
      .join()
      .receive("ok", function (resp) {
        console.log("Joined successfully", resp);
        wsThis.channel = channel;
        resolve(socket);
      })
      .receive("error", (resp) => {
        console.log("Unable to join", resp);
        reject(resp);
      });
  });
};
