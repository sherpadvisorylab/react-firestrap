import React, { createContext, useContext, useState, useEffect } from 'react';

const _GLOBAL_VARS = 'globalVars';
const GlobalContext = createContext();

// Funzione helper per leggere il localStorage
const getStoredGlobalVars = () => JSON.parse(localStorage.getItem(_GLOBAL_VARS) || '{}');

// Provider component to wrap around your app
export const GlobalProvider = ({ children }) => {
    const [globalVars, setGlobalVarsState] = useState(() => getStoredGlobalVars());

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.storageArea === localStorage && event.key === _GLOBAL_VARS) {
                setGlobalVarsState(getStoredGlobalVars());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateLocalStorage = (updatedVars) => {
        localStorage.setItem(_GLOBAL_VARS, JSON.stringify(updatedVars));
        setGlobalVarsState(updatedVars);
    };

    const setGlobalVars = (newVars, namespace) => {
        const updatedVars = { ...globalVars, [namespace]: newVars };
        updateLocalStorage(updatedVars);
    };

    const removeGlobalVars = (namespace) => {
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
export const useGlobalVars = (namespace?: string) => {
    const { globalVars, setGlobalVars, removeGlobalVars } = useContext(GlobalContext);

    return namespace
        ? [
            globalVars[namespace] || null,
            (newVars) => setGlobalVars(newVars, namespace),
            () => removeGlobalVars(namespace)
        ]
        : [globalVars, setGlobalVars, removeGlobalVars];
};

type GlobalVars = {
    [key: string]: any;
};

// Funzione per ottenere variabili globali dal localStorage
export const getGlobalVars = (namespace: string | null = null): GlobalVars => {
    const globalVars = getStoredGlobalVars();
    return namespace ? globalVars[namespace] || {} : globalVars;
};

// Funzione per impostare variabili globali nel localStorage senza usare il context
export const setGlobalVars = (value, namespace = null) => {
    const updatedVars = { ...getStoredGlobalVars(), [namespace]: value };
    localStorage.setItem(_GLOBAL_VARS, JSON.stringify(updatedVars));
};

// Funzione per rimuovere variabili globali dal localStorage senza usare il context
export const removeGlobalVars = (namespace = null) => {
    const updatedVars = { ...getStoredGlobalVars() };
    delete updatedVars[namespace];
    localStorage.setItem(_GLOBAL_VARS, JSON.stringify(updatedVars));
};
