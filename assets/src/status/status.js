export const setStatus = (statusMessage) => {
  const statusElement = document.getElementById("statusElement");
  statusElement.innerHTML = statusMessage;
};
