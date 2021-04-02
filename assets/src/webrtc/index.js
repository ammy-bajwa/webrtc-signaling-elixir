import { addWebrtcListener } from "./addWebrtcListener/addWebrtcListener";

import { initializeWebRTC } from "./initializeWebRTC/initializeWebRTC.js";

import { sendOffer } from "./sendOffer/sendOffer";

import { createDataChannel } from "./createDataChannel/createDataChannel";

import { settingUpDatachannels } from "./settingUpDatachannels/settingUpDatachannels";

import { createFileDataChannels } from "./createFileDataChannels/createFileDataChannels";

import { saveChunkInMemory } from "./saveChunkInMemory/saveChunkInMemory";

import { setupFilePeerConnection } from "./setupFilePeerConnection/setupFilePeerConnection";

import { initializeFileDataChannels } from "./initializeFileDataChannels/initializeFileDataChannels";

import { setupSingleFileDataChannel } from "./setupSingleFileDataChannel/setupSingleFileDataChannel";

export const alivaWebRTC = {
  peerConnection: null,
  dataChannels: {},
  filesPeerConnections: {},
  addWebrtcListener,
  initializeWebRTC,
  setupFilePeerConnection,
  initializeFileDataChannels,
  sendOffer,
  createDataChannel,
  settingUpDatachannels,
  createFileDataChannels,
  setupSingleFileDataChannel,
  chunks: {},
  saveChunkInMemory,
  chunkSize: 40000, // 40KB Batch chunk Size
  chunkCountInSingleBatch: 2500, // 40KB Batch chunk Size
  chunkCountInSingleSubBatch: 100, // 40KB Batch chunk Size
  numberOfBatchesInMemory: 500,
};
