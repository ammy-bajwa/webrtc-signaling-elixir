// import { getFileMetadataFromIndexedDB } from "../idbUtils/getFileMetadataFromIndexedDB/getFileMetadataFromIndexedDB";

import { alivaWebRTC } from "../webrtc/index";
import { deleteFileFromIDB } from "../idbUtils/deleteFileFromIDB/deleteFileFromIDB";
// import { sendFile } from "../webrtc/sendFile/sendFile";

import { requestingFile } from "../webrtc/requestingFile/requestingFile";

import redux from "../utils/manageRedux";

import { setStatus } from "../status/status";

const DisplayFiles = ({ files, isDelete }) => {
  let myFiles = [];
  for (const fileKey in files) {
    if (Object.hasOwnProperty.call(files, fileKey)) {
      const { name, size, isReceived, batchesMetaData, fileHash } = files[
        fileKey
      ];
      myFiles.push({ name, size, isReceived, batchesMetaData, fileHash });
    }
  }
  const deleteFile = async (metaData, fileName) => {
    if (metaData) {
      await deleteFileFromIDB(fileName, metaData);
      await redux.removeFileFromidbFiles(fileName);
      setStatus(
        `<h2>
          ${fileName} has been deleted successfully.
        </h2>`
      );
    }
  };
  // const handleGetFile = async (fileName) => {
  //   const fileMetadata = await getFileMetadataFromIndexedDB(fileName);
  //   await sendFile(fileMetadata);
  //   console.log("fileMetadata", fileMetadata);
  // };

  const requestFile = async (fileName) => {
    const dataChannelsCount = Object.keys(alivaWebRTC.dataChannels).length;
    setStatus("<h2>Setting up datachannels...</h2>");
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
      {myFiles.map(
        ({ name, size, isReceived, batchesMetaData, fileHash }, i) => (
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
            {isDelete ? (
              <button
                type="button"
                className="btn btn-danger m-2"
                onClick={() => deleteFile(batchesMetaData, name)}
              >
                Delete
              </button>
            ) : null}
          </span>
        )
      )}
    </div>
  );
};

export default DisplayFiles;
