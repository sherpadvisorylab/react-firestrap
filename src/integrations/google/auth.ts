import {decodeJWT} from "../../libs/utils";
import {GoogleAuthProvider} from "firebase/auth";

let config = null;

const init = (oAuth2, serviceAccount) => {
    config = { oAuth2, serviceAccount };
}

export const authConfig = (type: "oAuth2" | "serviceAccount") => {
    return config?.[type] || {};
}

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

export default init;





