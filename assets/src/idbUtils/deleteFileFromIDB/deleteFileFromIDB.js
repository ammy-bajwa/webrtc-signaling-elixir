import { openDB, deleteDB } from 'idb';
export const deleteFileFromIDB = (fileName, metaData) => {
    return new Promise(async (resolve, reject) => {
        try {
          const dbName = "files";
          const dbStore = "filesMetadata";
          const db = await openDB(dbName, 1);
          const key = fileName;
          await Object.values(metaData).forEach(async ({batchHash}) => {
            await deleteDB(batchHash);
          });
          await db.delete(dbStore, key);
          db.close();
          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
}