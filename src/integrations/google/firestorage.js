import firebase from "firebase/compat/app";
import "firebase/compat/storage";

let storageInstance = null;

const getStorage = () => {
    if (!storageInstance && firebase.apps.length) {
        storageInstance = firebase.app().storage();
    }
    return storageInstance || null;
};

const storage = {
    upload: async (file, path) => {
        if (!file) return;
        const storageRef = getStorage().ref(path);
        const snapshot = await storageRef.putString(file, 'data_url');
        return await snapshot.ref.getDownloadURL();
    },

    getURL: async (path) => {
        const storageRef = getStorage().ref(path);
        return await storageRef.getDownloadURL();
    },

    download: async (path) => {
        const storageRef = getStorage().ref(path);
        try {
            const url = await storageRef.getDownloadURL();
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch the file");
            }
            return await response.blob();
        } catch (error) {
            console.error("Error downloading file:", error);
            throw error;
        }
    },
    delete: async (path) => {
        const storageRef = getStorage().ref(path);
        try {
            await storageRef.delete();
            console.log(`File ${path} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting file ${path}:`, error);
            throw error;
        }
    }
};

export default storage;