import { getChunksArr } from "../../../fileUtils/getChunksArr/getChunksArr";

import { setStatus } from "../../../status/status";

// import { alivaWebRTC } from "../../../webrtc/index";

export const addFilesMetadata = async (files, chunkSize) => {
  const filesMetadataPromise = new Promise(async (resolve, reject) => {
    try {
      let filesObj,
        filesWithChunskingInfo = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = file["webkitRelativePath"];
        const fileName = file["name"];
        const fileSize = file["size"];
        setStatus(`<h2>Adding metadata to ${fileName}</h2>`);
        const allFileChunksArr = await getChunksArr(fileSize, chunkSize);
        filesObj = {
          filePath,
          fileName,
          fileSize,
          chunksArr: allFileChunksArr,
          totalFileChunksCount: allFileChunksArr.length,
          file,
        };
        filesWithChunskingInfo.push(filesObj);
      }
      resolve(filesWithChunskingInfo);
    } catch (error) {
      reject(error);
    }
  });
  return await filesMetadataPromise;
};
