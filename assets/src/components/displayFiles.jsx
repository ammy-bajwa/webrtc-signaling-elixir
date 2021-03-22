// import { getFileMetadataFromIndexedDB } from "../idbUtils/getFileMetadataFromIndexedDB/getFileMetadataFromIndexedDB";

import { alivaWebRTC } from "../webrtc/index";

// import { sendFile } from "../webrtc/sendFile/sendFile";

import { requestingFile } from "../webrtc/requestingFile/requestingFile";

const DisplayFiles = ({ files }) => {
  let myFiles = [];
  for (const fileKey in files) {
    if (Object.hasOwnProperty.call(files, fileKey)) {
      const { name, size, isReceived } = files[fileKey];
      myFiles.push({ name, size, isReceived });
    }
  }
  // const handleGetFile = async (fileName) => {
  //   const fileMetadata = await getFileMetadataFromIndexedDB(fileName);
  //   await sendFile(fileMetadata);
  //   console.log("fileMetadata", fileMetadata);
  // };

  const requestFile = async (fileName) => {
    const dataChannelsCount = Object.keys(alivaWebRTC.dataChannels).length;
    if (dataChannelsCount <= 0) {
      alert("Please connect webrtc");
      return;
    } else {
      await requestingFile(fileName);
    }
  };
  return (
    <div className="d-flex justify-content-center flex-wrap m-4">
      {myFiles.length === 0 && <h3 className="text-info">No File</h3>}
      {myFiles.map(({ name, size, isReceived }, i) => (
        <span className="border border-dark rounded m-2 p-2" key={i}>
          {name}--<b>{(size / 1000 / 1000).toFixed(2)}_MB</b>
          {isReceived && (
            <button
              type="button"
              className="btn btn-dark m-2"
              onClick={() => requestFile(name)}
            >
              Get File
            </button>
          )}
        </span>
      ))}
    </div>
  );
};

export default DisplayFiles;
