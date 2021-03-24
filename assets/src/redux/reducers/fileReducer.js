import { fileActionTypes } from "../actionTypes/index";
const {
  ADD_MACHINE_ID_AND_FILES,
  ADD_FILE,
  MOVE_TO_IDB_STATE,
  REMOVE_FILE_FROM_IDB_STATE,
  SAVE_RECEIVED_METADATA_IN_STATE,
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
    case SAVE_RECEIVED_METADATA_IN_STATE:
      let isAlreadyPresend = false;
      const receivedMetadata = action.payload.data;
      const updatedIdbFiles = state.idbFiles.map((fileMetadata) => {
        if (fileMetadata.fileName === receivedMetadata.fileName) {
          fileMetadata.batchesMetaData = {
            ...fileMetadata.batchesMetaData,
            ...receivedMetadata.batchesMetaData,
          };
          isAlreadyPresend = true;
        }
        return fileMetadata;
      });
      if (!isAlreadyPresend) {
        return {
          ...state,
          idbFiles: [receivedMetadata],
        };
      } else {
        return {
          ...state,
          idbFiles: updatedIdbFiles,
        };
      }
    default:
      return state;
  }
}
