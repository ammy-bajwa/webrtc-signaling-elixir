import { alivaWebRTC } from "../index";

import { setStatus } from "../../status/status";

import { saveBatchBlobToIdb } from "../../idbUtils/saveBatchBlobToIdb/saveBatchBlobToIdb";

import { convertInMemoryBatchToBlob } from "../../fileUtils/convertInMemoryBatchToBlob/convertInMemoryBatchToBlob";

import { batchConfirmationMemory } from "../batchConfirmationMemory/batchConfirmationMemory";

import { causeDelay } from "../../utils/causeDelay";

import { getHashOfArraybuffer } from "../../fileUtils/getHashOfArraybuffer/getHashOfArraybuffer";

import { findInMemoryMissingBatchChunks } from "../../fileUtils/findInMemoryMissingBatchChunks/findInMemoryMissingBatchChunks";

export const handleBatchConfirmation = (dataChannel, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        batchHash,
        fileName,
        batchKey,
        endBatchIndex,
        fileSize,
      } = message;

      const inMemoryBatchChunks = alivaWebRTC.chunks[fileName][batchHash];
      if (inMemoryBatchChunks?.confirmation) {
        dataChannel.send(
          JSON.stringify({
            isTotalBatchReceived: true,
            batchHash,
            batchKey,
            missingChunks: [],
          })
        );
        return;
      } else {
        let missingChunks = [];
        let isTotalBatchReceived = await batchConfirmationMemory(
          fileName,
          batchHash,
          batchKey
        );
        // if (!isTotalBatchReceived) {
        //   for (let index = 0; index <= 10; index++) {
        //     console.log("waiting....", index);
        //     await causeDelay(500);
        //     isTotalBatchReceived = await batchConfirmationMemory(
        //       fileName,
        //       batchHash,
        //       batchKey
        //     );
        //     if (isTotalBatchReceived) {
        //       break;
        //     }
        //   }
        // }
        if (isTotalBatchReceived) {
          setStatus(`<h2>Validating batch ${batchKey}</h2>`);
          const batchBlob = await convertInMemoryBatchToBlob(
            inMemoryBatchChunks
          );
          const inMemoryBlobArrayBuffer = await batchBlob.arrayBuffer();
          const inMemoryBlobHash = await getHashOfArraybuffer(
            inMemoryBlobArrayBuffer
          );
          if (inMemoryBlobHash !== batchHash) {
            isTotalBatchReceived = false;
            // find missing chunks here
            missingChunks = await findInMemoryMissingBatchChunks(
              fileName,
              batchKey,
              batchHash,
              inMemoryBatchChunks
            );
          } else {
            setStatus(`<h2>Saving batch in idb<${batchKey}</h2>`);
            missingChunks = await findInMemoryMissingBatchChunks(
              fileName,
              batchKey,
              batchHash,
              inMemoryBatchChunks
            );
            await saveBatchBlobToIdb(batchHash, batchBlob);
            alivaWebRTC.chunks[fileName][batchHash] = {
              confirmation: true,
            };
            setStatus(`<h2>
            ${(endBatchIndex / 1000 / 1000).toFixed(
              2
            )} MB has been saved ${fileName} file out of ${(
              fileSize /
              1000 /
              1000
            ).toFixed(2)} MB 
            </h2>`);
          }
        } else {
          missingChunks = await findInMemoryMissingBatchChunks(
            fileName,
            batchKey,
            batchHash,
            inMemoryBatchChunks
          );
          console.log(
            "Missing chunks: ",
            fileName,
            batchKey,
            Object.keys(inMemoryBatchChunks).length,
            missingChunks.length
          );
        }
        if (missingChunks.length > 0) {
          isTotalBatchReceived = false;
        }
        dataChannel.send(
          JSON.stringify({
            isTotalBatchReceived,
            batchHash,
            batchKey,
            missingChunks,
            fileName,
          })
        );
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
