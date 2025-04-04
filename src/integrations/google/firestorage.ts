import firebase from "firebase/compat/app";
import "firebase/compat/storage";

let storageInstance: firebase.storage.Storage | undefined;

const getStorage = (): firebase.storage.Storage | undefined => {
    if (!storageInstance && firebase.apps.length) {
        storageInstance = firebase.app().storage();
    }
    return storageInstance;
};

const storage = {
    upload: async (file: string, path: string): Promise<string | undefined> => {
        if (!file) return;

        const storageRef = getStorage()?.ref(path);
        if (!storageRef) {
            console.error("Firebase Storage not initialized");
            return;
        }

        try {
            const snapshot = await storageRef.putString(file, 'data_url');
            return await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error("Upload error:", error);
            return;
        }
    },
    getURL: async (path: string): Promise<string | undefined> => {
        const storageRef = getStorage()?.ref(path);
        if (!storageRef) return;

        try {
            return await storageRef.getDownloadURL();
        } catch (error) {
            console.error(`Error getting download URL for ${path}:`, error);
            return;
        }
    },
    download: async (path: string): Promise<Blob | undefined> => {
        const url = await storage.getURL(path);
        if (!url) return;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch the file");
            return await response.blob();
        } catch (error) {
            console.error("Error downloading file:", error);
            return;
        }
    },
    delete: async (path: string): Promise<boolean> => {
        const storageRef = getStorage()?.ref(path);
        if (!storageRef) return false;

        try {
            await storageRef.delete();
            console.log(`File ${path} deleted successfully`);
            return true;
        } catch (error) {
            console.error(`Error deleting file ${path}:`, error);
            return false;
        }
    }
};

export default storage;