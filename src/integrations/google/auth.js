import { Buffer } from 'buffer';
//import { createSign } from 'crypto';
import {decodeJWT} from "../../libs/utils.js";
import {GoogleAuthProvider} from "firebase/auth";

// Percorso al file delle credenziali del Service Account
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Funzione per creare il JWT manualmente
function createJWT(serviceAccountKey) {
    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: serviceAccountKey.client_email,
        sub: 'user@example.com', // L'utente che stai impersonando
        scope: GMAIL_SEND_SCOPE,
        aud: GOOGLE_TOKEN_URL,
        iat: now,
        exp: now + 3600, // Token valido per 1 ora
    };

    // Codifica base64 del JSON
    const base64Header = Buffer.from(JSON.stringify(header)).toString('base64').replace(/=/g, '');
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');

    // Firma il token
    const sign = ""; //createSign('RSA-SHA256');
    sign.update(`${base64Header}.${base64Payload}`);
    const signature = sign.sign(serviceAccountKey.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    return `${base64Header}.${base64Payload}.${signature}`;
}

// Funzione per ottenere l'access token usando un Service Account
async function getAccessToken() {
   // const serviceAccountKey = JSON.parse(fs.readFileSync(process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PATH));
    const serviceAccountKey = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_PATH;

    const jwtToken = createJWT(serviceAccountKey);

    const body = new URLSearchParams();
    body.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    body.append('assertion', jwtToken);

    // Usa fetch per richiedere il token
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
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





const googleAccessToken = async (credentials) => {
    const base64UrlEncode = (data) => {
        const base64 = Buffer.from(data).toString('base64');
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    // Creazione dell'intestazione JWT
    const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: credentials.private_key_id
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));

    // Creazione dell'insieme di attestazioni JWT
    const claims = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/prediction',
        aud: 'https://oauth2.googleapis.com/token',
        exp: Math.floor(Date.now() / 1000) + 3600, // Scadenza del token tra 1 ora
        iat: Math.floor(Date.now() / 1000)
    };

    const encodedClaims = base64UrlEncode(JSON.stringify(claims));

    // Creazione della stringa per la firma
    const dataToSign = `${encodedHeader}.${encodedClaims}`;

    // Firma con la chiave privata
    const signature = credentials.private_key;

    const encodedSignature = base64UrlEncode(signature);

    // Creazione del JWT completo
    const jwt = `${encodedHeader}.${encodedClaims}.${encodedSignature}`;

    // Creazione della richiesta POST per ottenere il token di accesso
    const postData = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
    };

    const response = await fetch(credentials.token_uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(postData)
    });

    // Decodifica della risposta JSON
    const tokenInfo = await response.json();

    return tokenInfo.access_token;
}