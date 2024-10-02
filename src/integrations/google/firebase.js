import firebase from "firebase/compat/app";
import 'firebase/compat/database';
import { getAdditionalUserInfo, getAuth, signInWithCredential, onAuthStateChanged } from "firebase/auth";
import { getGoogleCredential } from "./auth.js";

const getFirebaseAuthorization = async () => {
    const getUser = (auth) => {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    };

    const authorize = async () => {
        const auth = getAuth();
        const user = await getUser(auth);

        if (!user || !user.stsTokenManager || !user.stsTokenManager.accessToken) {
            console.error("Firebase access token not found");
            return requestLogin();
        }

        if (user.stsTokenManager.isExpired) {
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

    const requestLogin = async () => {
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
        } catch (error) {
            console.error("Firebase getAuthorization: ", error);
            return false;
        }

        return true;
    };

    return await authorize();
};

const init = async (config = null) => {
    const dbDefault = {
        apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
        databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL
    };

    if (config || !firebase.apps.length) {
        if (firebase.apps.length) {
            await firebase.app().delete();
        }

        firebase.initializeApp(config || dbDefault);
        await getFirebaseAuthorization();
    }

    return firebase.app();
};

export default init;
