import React from "react";
import {getAuth, GoogleAuthProvider, signInWithCredential, getAdditionalUserInfo, signOut} from 'firebase/auth';
import {Dropdown, DropdownDivider, DropdownItem, DropdownMenu} from "../../components/blocks/Dropdown";
import {decodeJWT, loadScripts} from "../../libs/utils";
import {PLACEHOLDER_USER, useTheme} from "../../Theme";
import {useGlobalVars} from "../../Global";
import {authConfig} from "./auth";
import TenantMenu from "../../Config";
import ImageAvatar from "../../components/ui/ImageAvatar";
import Menu from "../../components/blocks/Menu";

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (options: any) => void;
                    prompt: (callback?: () => void) => void;
                    renderButton: (element: HTMLElement, options: any) => void;
                    disableAutoSelect: () => void;
                    revoke: (hint: string, callback?: () => void) => void;
                };
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: TokenResponse) => void;
                    }) => {
                        requestAccessToken: () => void;
                    };
                    hasGrantedAllScopes?: (
                        response: TokenResponse,
                        ...scopes: string[]
                    ) => boolean;
                };
            };
        };
        handleGoogleSignIn: (response: { credential: string }) => void;
    }
}


interface GoogleAuthProps {
    scope: string;
    iconLogout: string;
    className?: string;
    avatarClass?: string;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

const loadScript = () => {
    loadScripts([
            {src: "https://accounts.google.com/gsi/client", async: true, clean: true}
    ]);
}

const GoogleAuthFallback = () => (
    <div className="menu-item dropdown dropdown-mobile-full" title="⚠️ Google OAuth2 config missing">
        <Dropdown className="me-lg-3"
            toggleButton={
                <div className="menu-img offline">
                    <img
                        src={PLACEHOLDER_USER}
                        alt="No Config"
                        height="36"
                        className="avatar rounded-circle ms-2"
                    />
                </div>
            }
        >
            <div className="text-danger p-2 small" style={{ maxWidth: 300, whiteSpace: "normal" }}>
                ⚠️ Google Single Sign-On is not configured.<br />
                Please make sure the <code>oAuth2.clientId</code> value is correctly set in your tenant configuration.
                <hr className="my-2" />
                <strong>To retrieve your <code>clientId</code>:</strong>
                <ol className="ps-3 mb-1">
                    <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                    <li>Select your project or create one</li>
                    <li>Navigate to <code>APIs & Services &gt; Credentials</code></li>
                    <li>Click <strong>“Create Credentials”</strong> &gt; <strong>OAuth client ID</strong></li>
                    <li>Select <strong>Web application</strong> as the type</li>
                    <li>Add your redirect URI (e.g. <code>https://yourdomain.com/auth/callback</code>)</li>
                    <li>Click <strong>Create</strong> and copy the <code>Client ID</code></li>
                </ol>
                Use that value in your config under <code>google.oAuth2.clientId</code>.
            </div>
        </Dropdown>
    </div>
);


const GoogleAuth = ({
                        scope,
                        iconLogout,
                        className = undefined,
                        avatarClass = undefined
}: GoogleAuthProps) => {
    const theme = useTheme("auth");
    const [ user, setUser, removeUser ] = useGlobalVars("user");
    const userProfile = user?.profile || {};

    const config = authConfig("oAuth2");
    if (!config) {
        console.warn("GoogleAuth: Missing oAuth2.clientId in configuration");
        return GoogleAuthFallback();
    }

    const firebaseSignInWithGoogleCredential = async(credentialToken: string): Promise<void> => {
        try {
            const credential = GoogleAuthProvider.credential(credentialToken);
            const userCredential = await signInWithCredential(getAuth(), credential);
            const additionalUserInfo = getAdditionalUserInfo(userCredential);

            setUser({
                ...userCredential.user,
                profile: additionalUserInfo?.profile
            });
        } catch (error) {
            console.error(error);
        }
    }
    const handleGoogleSignOut = async (): Promise<void> => {
        if (user?.profile?.sub) {
            window.google.accounts.id.revoke(user.profile.sub);
        }
        localStorage.removeItem("googleCredentialToken");

        removeUser();
        const auth = getAuth();

        await signOut(auth);
        console.log("Utente disconnesso da Firebase.");

        loadScript();
    }
    window.handleGoogleSignIn = ({credential}: {credential: string}): void => {
        const credentialDecoded = decodeJWT(credential);

        console.log(credential, credentialDecoded)
        localStorage.setItem("googleCredentialToken", credential);

        firebaseSignInWithGoogleCredential(credential);

        const gclient = window.google.accounts.oauth2.initTokenClient({
            client_id: config.clientId,
            scope: scope,
            callback: (tokenResponse: TokenResponse) => {
                console.log(tokenResponse);

                localStorage.setItem('googleAccessToken', tokenResponse.access_token);
                localStorage.setItem('googleExpiresAt', new Date(new Date().getTime() + tokenResponse.expires_in * 1000).toISOString());

                /*if (tokenResponse && tokenResponse.access_token) {
                    if (window.google.accounts.oauth2.hasGrantedAllScopes(tokenResponse,
                        'https://www.googleapis.com/auth/calendar.readonly',
                        'https://www.googleapis.com/auth/documents.readonly')) {
                        // Meeting planning and review documents

                    }
                }*/
            },
        });
        function isGoogleTokenExpired(): boolean {
            const expiresAt = localStorage.getItem('googleExpiresAt');
            return !expiresAt || new Date(expiresAt).getTime() < Date.now();
        }

        if (!localStorage.getItem('googleAccessToken') || isGoogleTokenExpired()) {
            // get access token
             //gclient.requestAccessToken();
        }
    };

    if(!window.google) {
        loadScript();
    }

    return (
        <>
            {!user && <div id="g_id_onload"
                                 data-client_id={config.clientId}
                                 data-context="signin"
                                 data-ux_mode="popup"
                                 data-callback="handleGoogleSignIn"
                                 data-auto_select="true"
                                 data-itp_support="true">
            </div>}



            { <div className={className || theme.SignIn.className}>
                <Dropdown 
                    position="end"
                    toggleButton={<ImageAvatar
                        src={userProfile.picture}
                        title={userProfile.name}
                        height={36}
                        className={avatarClass || theme.SignIn.avatarClass}
                    />}
                >
                    {!user && <>
                        <DropdownItem key={"g_id_signin"}>
                            <div className="g_id_signin"
                                 data-type="standard"
                                 data-shape="pill"
                                 data-theme="filled_white"
                                 data-text="signin"
                                 data-size="large"
                                 data-logo_alignment="left">
                            </div>
                        </DropdownItem>
                        <DropdownDivider />
                    </>}
                    <TenantMenu />
                    <DropdownMenu context={"profile"} />
                    
                    {user && <>
                        <DropdownDivider />
                        <DropdownItem onClick={handleGoogleSignOut} icon={iconLogout}>
                            LOGOUT
                        </DropdownItem>
                    </>}
                </Dropdown>
            </div>}
        </>
    );
}


export const googleGetAccessToken = (scopes: string[]): Promise<string> => {
    const config = authConfig("oAuth2");
    if (!config) {
        console.warn("GoogleAuth: Missing oAuth2.clientId in configuration");
        return Promise.reject("Google client ID not found");
    }

    const scope = scopes.join(' ');
    const tokenKey = `googleAccessToken::${scope}`;
    const expiresKey = `googleExpiresAt::${scope}`;

    return new Promise((resolve, reject) => {
        // Recupera il token e la data di scadenza da localStorage
        const accessToken = localStorage.getItem(tokenKey);
        const expiresAt = localStorage.getItem(expiresKey);
        const isExpired = !expiresAt || new Date(expiresAt).getTime() < Date.now();

        // Verifica se il token è ancora valido
        if (accessToken && !isExpired) {
            // Token esistente e valido, restituiscilo
            resolve(accessToken);
        } else {
            // Inizializza il client OAuth
            const gclient = window.google.accounts.oauth2.initTokenClient({
                client_id: config.clientId,
                scope,
                callback: (tokenResponse) => {
                    if (tokenResponse.access_token) {
                        // Salva il nuovo access token e la data di scadenza in localStorage
                        localStorage.setItem(tokenKey, tokenResponse.access_token);
                        localStorage.setItem(expiresKey, new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString());

                        // Restituisci il nuovo access token
                        resolve(tokenResponse.access_token);
                    } else {
                        reject('Failed to obtain access token');
                    }
                },
            });

            // Richiede il nuovo access token
            gclient.requestAccessToken();
        }
    });
};

export default GoogleAuth;
