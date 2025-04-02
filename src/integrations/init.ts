import { default as initFirebase } from './google/firebase';
import { default as initAuth } from './google/auth';
import { default as initDropBox } from './dropbox';
import { default as initAI } from './ai';

interface IntegrationConfig {
    firebaseConfig: object;
    oAuth2: object;
    serviceAccount: object;
    dropBoxConfig: object;
    aiConfig: object;
}

const initIntegration = (config: IntegrationConfig) => {
    initFirebase(config.firebaseConfig);
    initAuth(config.oAuth2, config.serviceAccount);
    initDropBox(config.dropBoxConfig);
    initAI(config.aiConfig);
}

export default initIntegration;