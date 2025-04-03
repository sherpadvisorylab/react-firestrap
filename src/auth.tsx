import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {fetchRest} from "./libs/fetch";
import {ActionButton} from "./components/Buttons";
import {IButton} from "./components/Buttons";
import {getGlobalVars, setGlobalVars, useGlobalVars} from "./Global";
import GoogleAuth from './integrations/google/GoogleAuth';

export { GoogleAuth as SignInButton };

interface IAuthResponse {
    iat: number,
    access_token : string,
    expires_in: number,
    token_type: string,
    scope: string,
    refresh_token: string,
    account_id: string,
    uid: string
}

interface AuthChallenge {
    authServer: string;
    clientID: string;
    codeVerifier: string;
}

export const AUTH_REDIRECT_URI = '/__/authorize';
const _AUTHS = "auths";

// Funzione per generare il code verifier
function generateCodeVerifier(): string {
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// Funzione per generare il code challenge
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

const openAuthWindow = (authUrl: string, windowName: string, width: number) => {
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - width / 2;
    const options = `width=${width},height=${width},top=${top},left=${left}`;
    return window.open(authUrl, windowName, options);
};

// Funzione per reindirizzare alla pagina di autorizzazione
function redirectToAuthPage({
                                authServer,
                                clientID,
                                scopes = undefined,
                                refreshParamName = "access_type"
}: {
    authServer: string,
    clientID: string,
    scopes?: string[],
    refreshParamName?: string
}) {
    const codeVerifier = generateCodeVerifier();
    localStorage.setItem('authChallenge', JSON.stringify({
        authServer, clientID, codeVerifier
    }));

    generateCodeChallenge(codeVerifier).then(codeChallenge => {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientID,
            redirect_uri: `${window.location.origin}${AUTH_REDIRECT_URI}`,
            scope: scopes ? scopes.join(' ') : '',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            [refreshParamName]: 'offline' // Aggiungi questo parametro per ottenere un refresh token
        });
        openAuthWindow(`https://${authServer}/authorize?${params.toString()}`, 'auth', 600);
    });
}

const setAuths  = (authServer: string, clientID: string, authResponse: IAuthResponse) : void => {
    setGlobalVars({[clientID] : {
        ...authResponse,
        server: authServer,
        client_id: clientID,
        iat: Math.floor(Date.now() / 1000)
    }}, _AUTHS);
}

// Componente Authorize per gestire il callback di autorizzazione
const Authorize = () => {
    const location = useLocation().search;

    useEffect(() => {
        const query = new URLSearchParams(location);

        const code = query.get('code');
        const getJsonFromStorage = <T = any>(key: string, fallback?: T): T | undefined => {
            try {
                return JSON.parse(localStorage.getItem(key) || '') || fallback;
            } catch {
                return fallback;
            }
        };

        const authChallenge = getJsonFromStorage<AuthChallenge>('authChallenge');
        if (!code || !authChallenge) return;

        const { authServer, clientID, codeVerifier } = authChallenge;
        fetchRest(`https://${authServer}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: {
                grant_type: 'authorization_code',
                client_id: clientID,
                code: code,
                redirect_uri: `${window.location.origin}${AUTH_REDIRECT_URI}`,
                code_verifier: codeVerifier
            }
        })
            .then((authResponse: IAuthResponse) => {
                setAuths(authServer, clientID, authResponse);
                localStorage.removeItem('authChallenge');
                window.close();
            })
            .catch(error => console.error('Error:', error));
    }, [location]);

    return <div>Loading...</div>;
};

const refreshAccessToken = (authServer: string, clientID: string, refresh_token: string): Promise<string | null> => {
    return fetchRest(`https://${authServer}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: {
            grant_type: 'refresh_token',
            client_id: clientID,
            refresh_token: refresh_token
        }
    })
        .then((authResponse: IAuthResponse) => {
            setAuths(authServer, clientID, authResponse);
            return authResponse.access_token;
        })
        .catch(error => {
            console.error('Error:', error);
            localStorage.removeItem('auths');
            return null;
        });
};

// Componente per il bottone di autorizzazione
export const AuthButton = ({
                               authServer,
                               clientID,
                               scopes = undefined,
                               refreshParamName = undefined,
                               options = {}
                           }: {
    authServer: string;
    clientID: string;
    scopes?: string[];
    refreshParamName?: string;
    options?: IButton;
}) => {
    return <ActionButton
        onClick={() => redirectToAuthPage({authServer, clientID, scopes, refreshParamName})}
        {...options}
    />;
};
export const useAccessToken = (clientID: string, renew: boolean = true): boolean => {
    const [auths] = useGlobalVars(_AUTHS);
    const auth = auths?.[clientID] || {};

    const isExpired = Math.floor(Date.now() / 1000) >= (auth?.iat + auth?.expires_in);
    return !!(auth && auth?.access_token && (!isExpired || (renew && isExpired && auth.refresh_token && (refreshAccessToken(auth.server, auth.client_id, auth.refresh_token) || true))));
}

const getAuth = (clientID: string) => {
    const auths = getGlobalVars(_AUTHS);
    return auths?.[clientID];
};

export const getAccessToken = (clientID: string): Promise<string | null> => {
    const auth = getAuth(clientID);
    const isExpired = Math.floor(Date.now() / 1000) > auth?.iat + auth?.expires_in;

    if (!isExpired && auth?.access_token) {
        return Promise.resolve(auth.access_token);
    } else if (isExpired && auth?.refresh_token) {
        return refreshAccessToken(auth.server, auth.client_id, auth.refresh_token);
    }

    return Promise.resolve(null);
};



export default Authorize;
