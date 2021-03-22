import { alivaWebRTC } from "../index";

export const settingUpDatachannels = (numberOfDataChannels) => {
  return new Promise(async (resolve, reject) => {
    try {
      for (let index = 0; index <= numberOfDataChannels; index++) {
        await alivaWebRTC.createFileDataChannels(`dc_${index}`);
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
