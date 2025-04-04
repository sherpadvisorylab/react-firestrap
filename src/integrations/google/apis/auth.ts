import { createSign } from 'crypto';
import {base64Encode} from "../../../libs/utils";
import {Config, GoogleServiceAccount, onConfigChange} from "../../../Config";

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

let config: GoogleServiceAccount | undefined = undefined;
onConfigChange((newConfig: Config) => {
    config = newConfig.google.serviceAccount;
});

/**
 * Genera un JWT firmato per autenticarsi come Service Account impersonando un utente.
 */
function createSignedJWT(scope: string, userToImpersonate: string): string {
    if(!config) {
        console.warn("Google: Service account not found");
        return "";
    }
    const header = {
        alg: 'RS256',
        typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: config.client_email,
        sub: userToImpersonate, // impersonazione utente
        scope,
        aud: GOOGLE_TOKEN_URL,
        iat: now,
        exp: now + 3600, // 1 ora
    };

    const encodedHeader = base64Encode(JSON.stringify(header));
    const encodedPayload = base64Encode(JSON.stringify(payload));
    const jwtToSign = `${encodedHeader}.${encodedPayload}`;

    const sign = createSign('RSA-SHA256');
    sign.update(jwtToSign);
    sign.end();
    const signature = sign
        .sign(config.private_key, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${jwtToSign}.${signature}`;
}

/**
 * Ottiene un access token valido da Google utilizzando un Service Account.
 */
export async function getGoogleAccessToken(
    scope: string,
    userToImpersonate: string
): Promise<string> {
    const jwt = createSignedJWT(scope, userToImpersonate);

    const body = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Access token request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
}
