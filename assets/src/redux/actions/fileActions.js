import { fileActionTypes } from "../actionTypes/index";
const {
  ADD_MACHINE_ID_AND_FILES,
  ADD_FILE,
  MOVE_TO_IDB_STATE,
  REMOVE_FILE_FROM_IDB_STATE,
  SAVE_RECEIVED_METADATA_IN_STATE,
} = fileActionTypes;
export const fileActions = {
  storeMachineIDAndFiles: function (payload) {
    return {
      type: ADD_MACHINE_ID_AND_FILES,
      payload,
    };
  },
  storeFile: function (payload) {
    return {
      type: ADD_FILE,
      payload,
    };
  },
  moveFileToidbState: function (payload) {
    return {
      type: MOVE_TO_IDB_STATE,
      payload,
    };
  },
  removeFileFromidbState: function (payload) {
    return {
      type: REMOVE_FILE_FROM_IDB_STATE,
      payload,
    };
  },
  saveMetadataInState: function (payload) {
    return {
      type: SAVE_RECEIVED_METADATA_IN_STATE,
      payload,
    };
  },
};
