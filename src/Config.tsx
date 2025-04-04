import React, {createContext, useContext, useState, ReactNode, useRef, useEffect} from 'react';
import {fetchJson} from "./libs/fetch";
import {DropdownLink} from "./components/Dropdown";

export type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
};

export type GoogleOAuth2 = {
    clientId: string;
};

export type GoogleServiceAccount = {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
};

export type GoogleConfig = {
    oAuth2: GoogleOAuth2;
    serviceAccount?: GoogleServiceAccount;
    developerToken?: string;
}

export type DropboxConfig = {
    clientId: string;
    rootPath: string;
};

export type AIConfig = {
    geminiApiKey?: string;
    chatGptApiKey?: string;
};

export type Config = {
    title: string;
    firebase: FirebaseConfig;
    google: GoogleConfig;
    dropbox?: DropboxConfig;
    ai?: AIConfig;
    proxyURI?: string;
};

interface TenantMenuItem {
    title: string;
    icon: string;
    active: boolean;
    onClick: () => void;
}

type ConfigChangeHandler = (newConfig: Config, prevConfig: Config | null) => void;


let tenantsMenu: TenantMenuItem[]   = [];
let tenantsConfig: Config[]         = [];
let currentConfig: Config | undefined = undefined;


const ConfigContext = createContext<Config | null>(null);
const ConfigUpdateContext = createContext<(cfg: Config) => void>(() => {});

const configChangeHandlers: Set<ConfigChangeHandler> = new Set();
export const onConfigChange = (fn: ConfigChangeHandler) => {
    configChangeHandlers.add(fn);
    if (currentConfig) fn(currentConfig, null);
};

const useConfig = () => useContext(ConfigContext);
const useSetConfig = () => useContext(ConfigUpdateContext);

export const ConfigProvider = ({
                                   children,
                                   defaultConfig,
                                   tenantsURI
                               }: {
    children: ReactNode;
    defaultConfig: Config;
    tenantsURI?: string;
}) => {
    const [config, setConfig] = useState<Config>(initConfig(defaultConfig, tenantsURI));
    const prevConfigRef = useRef<Config | null>(null);

    useEffect(() => {
        const prev = prevConfigRef.current;

        if (prev !== config) {
            currentConfig = config;
            for (const handler of configChangeHandlers) {
                handler(config, prev);
            }
        }

        prevConfigRef.current = config;
    }, [config]);

    return (
        <ConfigContext.Provider value={config}>
            <ConfigUpdateContext.Provider value={setConfig}>
                {children}
            </ConfigUpdateContext.Provider>
        </ConfigContext.Provider>
    );
};

const initConfig = (defaultConfig: Config, tenantsURI ?: string): Config => {
    const loadTenants = async () => {
        if (!tenantsURI) {
            return;
        }

        try {
            const fetchedTenants = await fetchJson(tenantsURI);
            tenantsConfig = [defaultConfig, ...fetchedTenants];
            localStorage.setItem("tenants", JSON.stringify(tenantsConfig));
        } catch (err) {
            console.warn("No tenants found at", tenantsURI);
        }
    }

    tenantsConfig = [defaultConfig];
    currentConfig = defaultConfig;
    loadTenants();

    return currentConfig;
}

export const getConfig = () => currentConfig;

const useTenants = (setTenants: (items: TenantMenuItem[]) => void): void => {
    const setConfig = useSetConfig();
    const currentConfig = useConfig();

    if (tenantsMenu.length > 0) {
        // già inizializzati → li setto subito
        setTenants(tenantsMenu);
        return;
    }

    // recupero dal localStorage una sola volta
    const stored = localStorage.getItem("tenants");
    if (!stored) return;

    try {
        tenantsConfig = JSON.parse(stored);

        tenantsMenu = tenantsConfig.map((tenant, index) => ({
            title: tenant.title || `Tenant ${index}`,
            icon: "folder",
            active: tenant.firebase.appId === currentConfig?.firebase.appId,
            onClick: () => {
                const selectedConfig = tenantsConfig[index];
                setConfig(selectedConfig);

                tenantsMenu = tenantsMenu.map((t, i) => ({
                    ...t,
                    active: i === index
                }));

                setTenants(tenantsMenu);
            }
        }));

        setTenants(tenantsMenu);
    } catch (e) {
        console.error("Error parsing tenants from localStorage", e);
    }
};


export const TenantMenu = () => {
    const [tenants, setTenants] = useState<TenantMenuItem[]>([]);

    useTenants(setTenants);

    if (tenants.length === 0) return null;

    return (
        <>
            <div className="dropdown-header">Projects</div>
            {tenants.map((item) => (
                <DropdownLink key={item.title} onClick={item.onClick}>
                    <i className={`me-1 ${item.active ? "text-success" : "text-muted"}`}>
                        <i className={`bi bi-${item.icon}`} />
                    </i>
                    {item.title}
                </DropdownLink>
            ))}
            <div className="dropdown-divider" />
        </>
    );
};

export default TenantMenu;
