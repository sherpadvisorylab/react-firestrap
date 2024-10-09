import { default as initFirebase } from './google/firebase';
import { default as initAuth } from './google/auth';
import { default as initDropBox } from './dropbox';
import { default as initAI } from './ai';

const initIntegration = (config) => {
    initFirebase(config.firebaseConfig);
    initAuth(config.oAuth2, config.serviceAccount);
    initDropBox(config.dropBoxConfig);
    initAI(config.aiConfig);
}

export default initIntegration;