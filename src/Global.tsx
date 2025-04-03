import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';

type GlobalVars = {
    [key: string]: any;
};

interface GlobalContextType {
    globalVars: GlobalVars;
    setGlobalVars: (value: any, namespace: string) => void;
    removeGlobalVars: (namespace: string) => void;
}

const _GLOBAL_VARS = 'globalVars';
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Funzione helper per leggere il localStorage
const getStoredGlobalVars = () => JSON.parse(localStorage.getItem(_GLOBAL_VARS) || '{}');

// Provider component to wrap around your app
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [globalVars, setGlobalVarsState] = useState(() => getStoredGlobalVars());

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.storageArea === localStorage && event.key === _GLOBAL_VARS) {
                setGlobalVarsState(getStoredGlobalVars());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateLocalStorage = (updatedVars: GlobalVars) => {
        localStorage.setItem(_GLOBAL_VARS, JSON.stringify(updatedVars));
        setGlobalVarsState(updatedVars);
    };

    const setGlobalVars = (value: any, namespace: string): void => {
        const updatedVars = { ...globalVars, [namespace]: value };
        updateLocalStorage(updatedVars);
    };

    const removeGlobalVars = (namespace: string): void => {
        const updatedVars = { ...globalVars };
        delete updatedVars[namespace];
        updateLocalStorage(updatedVars);
    };

    return (
        <GlobalContext.Provider value={{ globalVars, setGlobalVars, removeGlobalVars }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook per utilizzare globalVars con o senza namespace
export const useGlobalVars = <T = any>(namespace: string): [
    value: T | null,
    set: (newVars: T) => void,
    remove: () => void
] => {
    const context = useContext(GlobalContext);
    if (!context) throw new Error("useGlobalVars must be used within a GlobalProvider");

    const { globalVars, setGlobalVars, removeGlobalVars } = context;

    return [
        globalVars[namespace] ?? null,
        (newVars: T) => setGlobalVars(newVars, namespace),
        () => removeGlobalVars(namespace),
    ];
};

// Funzione per ottenere variabili globali dal localStorage
export const getGlobalVars = (namespace: string | null = null): GlobalVars => {
    const globalVars = getStoredGlobalVars();
    return namespace ? globalVars[namespace] || {} : globalVars;
};

// Funzione per impostare variabili globali nel localStorage senza usare il context
export const setGlobalVars = (value: any, namespace: string): void => {
    const updatedVars = { ...getStoredGlobalVars(), [namespace]: value };
    localStorage.setItem(_GLOBAL_VARS, JSON.stringify(updatedVars));
};

// Funzione per rimuovere variabili globali dal localStorage senza usare il context
export const removeGlobalVars = (namespace: string): void => {
    const updatedVars = { ...getStoredGlobalVars() };
    delete updatedVars[namespace];
    localStorage.setItem(_GLOBAL_VARS, JSON.stringify(updatedVars));
};
