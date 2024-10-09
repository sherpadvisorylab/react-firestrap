export { default } from '../integrations/google/firestorage';

/*
let store = null;
const load = (integrationName = null) => {
    try {
        switch (integrationName) {
            case 'dropbox':
                store = import('../integrations/dropbox/storage.js');
                break;
            case 'firebase':
            default:
                store = import('../integrations/google/firestorage.js');
        }

        console.log(`Storage configured with: ${integrationName}`);
    } catch (error) {
        console.error('Failed to configure storage:', error);
        throw error;
    }
};

export const storage = () => {
    return store || load();
};

export default storage;

 */
