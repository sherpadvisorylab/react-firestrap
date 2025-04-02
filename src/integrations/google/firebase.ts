import firebase from "firebase/compat/app";
import 'firebase/compat/database';
import { getAdditionalUserInfo, getAuth, signInWithCredential, onAuthStateChanged, Auth, User } from "firebase/auth";
import { getGoogleCredential } from "./auth";

interface TokenInfo {
    accessToken?: string;
    refreshToken?: string;
    expirationTime?: number;
    isExpired: boolean;
}

const getUser = (auth: Auth): Promise<User | null> => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
};

const requestLogin = async (): Promise<boolean> => {
    console.log("Requesting user login.");
    const googleCredential = getGoogleCredential();
    if (!googleCredential) {
        console.error("Firebase: Google credential not found.");
        return false;
    }

    try {
        const userCredential = await signInWithCredential(getAuth(), googleCredential);
        const additionalUserInfo = getAdditionalUserInfo(userCredential);
        if (additionalUserInfo?.isNewUser) {
            // you can do something here with the new user
        }
        console.log("Firebase: User logged in successfully.");
        return true;
    } catch (error) {
        console.error("Firebase getAuthorization: ", error);
        return false;
    }
};

function getTokenInfo(user: User): TokenInfo {
    const { stsTokenManager } = user.toJSON() as {
        stsTokenManager?: {
            accessToken?: string;
            refreshToken?: string;
            expirationTime?: number;
        };
    };

    const expirationTime = stsTokenManager?.expirationTime ?? 0;

    return {
        accessToken: stsTokenManager?.accessToken,
        refreshToken: stsTokenManager?.refreshToken,
        expirationTime: stsTokenManager?.expirationTime,
        isExpired: expirationTime < Date.now(),
    };
}

const getFirebaseAuthorization = async (): Promise<boolean> => {
    const auth = getAuth();
    const user = await getUser(auth);
    if(!user) {
        console.error("Firebase user not found");
        return requestLogin();
    }
    const tokenInfo = getTokenInfo(user);

    if (!tokenInfo.accessToken) {
        console.error("Firebase access token not found");
        return requestLogin();
    }

    if (tokenInfo.isExpired) {
        try {
            await user.getIdToken(true);
            console.log("Token refreshed successfully.");
            return true;
        } catch (error) {
            console.error("Firebase token refresh error: ", error);
            return requestLogin();
        }
    }

    console.log("Using valid Firebase access token.");
    return true;
};

const init = async (config: Object): Promise<firebase.app.App> => {
    if (firebase.apps.length) {
        await firebase.app().delete();
    }

    firebase.initializeApp(config);
    await getFirebaseAuthorization();

    return firebase.app();
};

export default init;
