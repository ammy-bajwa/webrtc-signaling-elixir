import { useState, useEffect } from "react";
import { getFileBatchesFromIDB } from "../idbUtils/getFileBatches/getFileBatches";
import Modal from "./modal";
import { deleteFileFromIDB } from "../idbUtils/deleteFileFromIDB/deleteFileFromIDB";
import { alivaWebRTC } from "../webrtc/index";
import { sendFilesMetadata } from "../webrtc/sendFilesMetadata/sendFilesMetadata";
import { connect } from "react-redux";

import redux from "../utils/manageRedux";

import { setStatus } from "../status/status";

const DisplayIdbFiles = function ({ files, fileState }) {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState("");

  const getVideo = async (batchesMetaData) => {
    let getFile = await getFileBatchesFromIDB(batchesMetaData);
    let fileURL = await URL.createObjectURL(getFile);

    setFile(fileURL);
    openModal();
  };
  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }
  const deleteFile = async (metaData, fileName) => {
    if (metaData) {
      await deleteFileFromIDB(fileName, metaData);
      redux.removeFileFromidbFiles(fileName);
      setStatus(
        `<h2>
          ${fileName} has been deleted successfully.
        </h2>`
      );
    }
  };
  const checkFileType = (fileName) => {
    let fileType = fileName.slice(fileName.indexOf(".") + 1).toLowerCase();
    if (
      fileType == "mp4" ||
      fileType == "m4p" ||
      fileType == "flv" ||
      fileType == "mkv" ||
      fileType == "webm" ||
      fileType == "vob" ||
      fileType == "ogv" ||
      fileType == "ogg" ||
      fileType == "avi" ||
      fileType == "wmv" ||
      fileType == "rm" ||
      fileType == "amv" ||
      fileType == "m4v" ||
      fileType == "mpg" ||
      fileType == "mp2" ||
      fileType == "mpeg" ||
      fileType == "mpe" ||
      fileType == "mpv" ||
      fileType == "m2v" ||
      fileType == "svi" ||
      fileType == "3gp" ||
      fileType == "3g2" ||
      fileType == "mxf" ||
      fileType == "nsv" ||
      fileType == "f4v" ||
      fileType == "f4p" ||
      fileType == "f4a" ||
      fileType == "f4b"
    ) {
      return true;
    }
    return false;
  };
  const filterFileforMetaData = (idbFiles, fileHash) => {
    return idbFiles.filter((file) => file.fileHash === fileHash);
  };
  const handleFileSyncMetadata = async (fileHash) => {
    const { idbFiles } = fileState;
    console.log("file sync", idbFiles);
    console.log("file sync", fileHash);
    const webRTCConnState = alivaWebRTC.peerConnection.connectionState;
    if (idbFiles.length <= 0) {
      alert("Please upload a file first");
      return;
    } else if (webRTCConnState !== "connected") {
      alert("Please connect webrtc first");
      return;
    } else {
      console.log(filterFileforMetaData(idbFiles, fileHash));
      await sendFilesMetadata(
        filterFileforMetaData(idbFiles, fileHash),
        alivaWebRTC
      );
      return;
    }
  };
  return (
    <div className="d-flex justify-content-center flex-wrap m-4">
      {files.length === 0 && <h3 className="text-info">No File</h3>}
      {files.map(
        (
          { name, size, isReceived, isOnlyMetadata, batchesMetaData, fileHash },
          i
        ) => (
          <div key={i} className="m-3">
            {!isReceived && !isOnlyMetadata && (
              <span className="border border-dark rounded m-2 p-3">
                {name}--<b>{(size / 1000 / 1000).toFixed(2)}_MB</b>
                <button
                  type="button"
                  className="btn btn-primary m-2"
                  onClick={() => handleFileSyncMetadata(fileHash)}
                >
                  Sync
                </button>
                <button
                  type="button"
                  className="btn btn-danger m-2"
                  onClick={() => deleteFile(batchesMetaData, name)}
                >
                  Delete
                </button>
                {checkFileType(name) ? (
                  <button
                    className="btn btn-success m-1"
                    onClick={() => getVideo(batchesMetaData)}
                  >
                    Play
                  </button>
                ) : null}
              </span>
            )}
            <Modal
              modalIsOpen={modalIsOpen}
              openModal={openModal}
              closeModal={closeModal}
              file={file}
            />
          </div>
        )
      )}
    </div>
  );
};
const mapStateToProps = function (state) {
  return {
    fileState: state.fileReducer,
  };
};

export default connect(mapStateToProps)(DisplayIdbFiles);
