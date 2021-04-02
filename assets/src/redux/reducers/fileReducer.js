import { fileActionTypes } from "../actionTypes/index";
const {
  ADD_MACHINE_ID_AND_FILES,
  ADD_FILE,
  MOVE_TO_IDB_STATE,
  REMOVE_FILE_FROM_IDB_STATE,
  SAVE_RECEIVED_METADATA_IN_STATE,
  CLEAR_STATE,
  SAVE_RECEIVED_SUB_BATCH_METADATA_IN_STATE,
  SAVE_SMALL_FILE,
} = fileActionTypes;
const initState = {
  machineId: "",
  files: [],
  idbFiles: [],
};

export default function todos(state = initState, action) {
  switch (action.type) {
    case ADD_MACHINE_ID_AND_FILES:
      return {
        machineId: action.payload.machineId,
        idbFiles: action.payload.idbFiles,
        files: state.files,
      };
    case ADD_FILE:
      return {
        machineId: state.machineId,
        idbFiles: state.idbFiles,
        files: action.payload.files,
      };
    case MOVE_TO_IDB_STATE:
      return {
        machineId: state.machineId,
        idbFiles: action.payload.files,
        files: state.files.filter((file) => {
          return file.name !== action.payload.fileName;
        }),
      };
    case REMOVE_FILE_FROM_IDB_STATE:
      return {
        machineId: state.machineId,
        files: state.files,
        idbFiles: state.idbFiles.filter((file) => {
          return file.name !== action.payload.fileName;
        }),
      };

    case SAVE_SMALL_FILE:
      const fileMetadata = action.payload.data;
      return {
        ...state,
        idbFiles: state.idbFiles.concat([fileMetadata]),
      };

    case SAVE_RECEIVED_SUB_BATCH_METADATA_IN_STATE:
      let isAlreadyPresent = false;
      const receivedSubBatchMetadata = action.payload.data;
      const updatedSubBatchIdbFiles = state.idbFiles.map((fileMetadata) => {
        if (fileMetadata.name === receivedSubBatchMetadata.name) {
          if (fileMetadata?.subBatchesMetaData) {
            fileMetadata.subBatchesMetaData = {
              ...fileMetadata.subBatchesMetaData,
              ...receivedSubBatchMetadata.subBatchesMetaData,
            };
          } else {
            fileMetadata.subBatchesMetaData = {
              ...receivedSubBatchMetadata.subBatchesMetaData,
            };
          }
          isAlreadyPresent = true;
        }
        return fileMetadata;
      });
      if (!isAlreadyPresent) {
        return {
          ...state,
          idbFiles: state.idbFiles.concat([receivedSubBatchMetadata]),
        };
      } else {
        return {
          ...state,
          idbFiles: updatedSubBatchIdbFiles,
        };
      }
    case SAVE_RECEIVED_METADATA_IN_STATE:
      let isFileAlreadyPresent = false;
      const receivedMetadata = action.payload.data;
      const updatedIdbFiles = state.idbFiles.map((fileMetadata) => {
        if (fileMetadata.name === receivedMetadata.name) {
          fileMetadata.batchesMetaData = {
            ...fileMetadata.batchesMetaData,
            ...receivedMetadata.batchesMetaData,
          };
          isFileAlreadyPresent = true;
        }
        return fileMetadata;
      });
      if (!isFileAlreadyPresent) {
        return {
          ...state,
          idbFiles: state.idbFiles.concat([receivedMetadata]),
        };
      } else {
        return {
          ...state,
          idbFiles: updatedIdbFiles,
        };
      }
    case CLEAR_STATE:
      return {
        machineId: "",
        idbFiles: [],
        files: [],
      };
    default:
      return state;
  }
}
