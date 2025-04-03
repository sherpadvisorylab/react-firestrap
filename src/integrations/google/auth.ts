import {decodeJWT} from "../../libs/utils";
import {GoogleAuthProvider} from "firebase/auth";
import {Config, GoogleConfig, onConfigChange} from "../../Config";

let config: GoogleConfig | undefined = undefined;
onConfigChange((newConfig: Config) => {
    config = newConfig.google;
});

export const authConfig = <K extends keyof GoogleConfig>(
    key: K
): GoogleConfig[K] | undefined => {
    return config?.[key];
};

export const getGoogleCredential = () => {
    const googleCredentialToken = localStorage.getItem("googleCredentialToken");
    if (!googleCredentialToken) {
        console.error("Google credential token not found");
        return null;
    }
    const decodedToken = decodeJWT(googleCredentialToken);
    if (decodedToken.exp < Date.now() / 1000) {
        console.error("Google credential token expired");
        return null;
    }

    try {
        return GoogleAuthProvider.credential(googleCredentialToken);
    } catch (error) {
        console.error(error);
    }

    return null;
}




