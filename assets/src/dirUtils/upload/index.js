import { addFilesMetadata } from "./addFilesMetadata/addFilesMetadata";

import { uploadBatches } from "./uploadBatches/uploadBatches";

import { setStatus } from "../../status/status";

export const handleDirUpload = async (
  fileElement,
  chunkSize,
  numberOfChunksInSingleBatch
) => {
  const files = fileElement.files;
  console.log("files:",files)
  const fileInfoHtml = getFilesInfoString(files);
  setStatus(fileInfoHtml);

  // Here we are adding files metadata info to file objects
  const filesWithMetadata = await addFilesMetadata(files, chunkSize);

  setStatus(`<h2>Generating files batches.....</h2>`);

  // Here we will upload batches in
  await uploadBatches(filesWithMetadata, numberOfChunksInSingleBatch);
  console.log("filesMEtadata:>>>>>>",filesWithMetadata)
};

const getFilesInfoString = (files) => {
  let fileInfoHtml = "";
  for (let index = 0; index < files.length; index++) {
    const { name } = files[index];
    fileInfoHtml += `<h2 class="m-2 p-2 border border-secondary">${name}</h2>`;
  }
  return fileInfoHtml;
};
