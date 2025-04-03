import {converter} from "./converter";
import {getConfig} from "../Config";

export const decodeJWT = (token: string): any => {
    try {
        // Divide il token nelle sue parti: header, payload, firma
        const payloadEncoded = token.split('.');

        // Decodifica la parte payload (Base64)
        const payloadDecoded = atob(payloadEncoded[1]);

        // Parsa la parte payload in un oggetto JSON
        return JSON.parse(payloadDecoded);
    } catch (error) {
        console.error('Errore durante la decodifica del token:', error);
    }
};
export const copyToClipboard = (text: string): void => {
    try {
        // Copia il selettore direttamente negli appunti
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Selettore HTML copiato negli appunti:', text);
            })
            .catch((err) => {
                console.error('Errore durante la copia del selettore HTML negli appunti:', err);
            });
    } catch (err) {
        console.error('Clipboard API non supportata:', err);
    }
};

export const trimPath = (path?: string): string => {
    return normalizePath(path)
        .replace(/\/$/, "")
        .replace(/^\//, "");
};

export const normalizePath = (path?: string): string => {
    if(!path) return '';
    return path
        .replaceAll(" ", "-")
        .replaceAll("'", "-")
        .replaceAll('"', "-")
        .toLowerCase()
        .replace(/[^a-z0-9\-/]+/g, "")
        .replace(/-+/g, "-")
        .replace(/\/+/g, "/");
};

export const trimSlash = (path?: string): string => {
    if(!path) return '';
    return (path && path.startsWith('/')
            ? path.substring(1)
            : path
    );
};

export const normalizeKey = (key?: string): string => {
    if(!key) return '';

    return trimSlash(key)
        .trim()
        .replaceAll("/", "|")
        .replaceAll(" ", "-")
        .replaceAll("'", "-")
        .replaceAll('"', "-")
        .replaceAll(".", "-")
        .replaceAll("@", "-")
        .replaceAll("#", "-")
        .replaceAll("$", "-")
        .replaceAll("[", "-")
        .replaceAll("]", "-")
        .replaceAll("_", "-")
        .toLowerCase()
        .replace(/[^a-z0-9\-|]+/g, "");
};



export const dirname = (path: string): string => {
    // Controlla se il path è una stringa vuota
    if (!path) return '';

    // Rimuovi lo slash finale se presente
    path = path.replace(/\/$/, "");

    // Separa il path in segmenti usando la barra di divisione
    const segments = path.split("/");

    // Rimuovi l'ultimo segmento (il nome del file)
    segments.pop();

    // Ricostruisci il percorso della directory padre
    return segments.join("/");
};

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function proxy(url: string, format: string = 'json'): string {
    const config = getConfig();
    return (
        config?.proxyURI
            ? config.proxyURI + encodeURIComponent(url) + "&f=" + format
            : url
    );
}

export function generateUniqueId(name = null) {
    const timestamp = Date.now().toString(36); // Converti il timestamp in base 36
    const randomStr = name || Math.random().toString(36).substring(2); // Genera una stringa casuale

    return `${timestamp}-${randomStr}`;
}

export function eventClosest(e: Event, tagName: string): HTMLElement | null {
    // Se il target è già un elemento con il tag desiderato, restituisci il target stesso

    let currentElement =  e.target as HTMLElement;
    if (currentElement.tagName.toLowerCase() === tagName.toLowerCase()) {
        return currentElement;
    }

    // Risali fino a trovare il primo elemento con il tag desiderato
    while (currentElement.parentNode) {
        const parentElement = currentElement.parentNode as HTMLElement;
        if (parentElement.tagName.toLowerCase() === tagName.toLowerCase()) {
            // Trovato un elemento con il tag desiderato nel cammino verso l'alto
            return parentElement;
        }
        currentElement = parentElement;
    }

    // Se non hai trovato un elemento con il tag desiderato, restituisci null
    return null;
}


export const substrCount = (str: string, sub: string): number => {
    return str.split(sub).length - 1;
};

export const replacePlaceholders = (
    pattern: string,
    arrPath: string[]
): string => {
    return pattern.replace(/\$(\d+)/g, (match: string, placeholderIndex: string) => {
        const index = parseInt(placeholderIndex);
        return arrPath[index] || "";
    }).trim();
}


export const checkConditions = (
    conds: Array<{ key: string; value: string; operator: string }>,
    metaObject: { [key: string]: string | undefined },
    tokens: string[]
): boolean => {
    for (const cond of conds) {
        const key = normalizePath(replaceVariables(cond.key, metaObject));
        const value = normalizePath(replacePlaceholders(replaceVariables(cond.value, metaObject), tokens));

        if (((cond.operator === "==" || cond.operator === "=") && key === value) ||
            (cond.operator === "!=" && key !== value) ||
            (cond.operator === ">" && key > value) ||
            (cond.operator === "<" && key < value) ||
            (cond.operator === ">=" && key >= value) ||
            (cond.operator === "<=" && key <= value) ||
            (cond.operator === "contains" && key.includes(value)) ||
            (cond.operator === "not contains" && !key.includes(value))) {
            return true;
        }
    }
    return false;
}

export const crc32 = (str: string) => {
    const crcTable: number[] = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            if (c & 1) {
                c = 0xEDB88320 ^ (c >>> 1);
            } else {
                c = c >>> 1;
            }
        }
        crcTable[i] = c;
    }

    let crc = 0 ^ (-1);

    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
}

export const ucfirst = (str?: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const loadScripts = (scriptData: Array<{ src: string; [key: string]: any }>): void => {
    if (!scriptData.length) return;

    const scriptFragment = document.createDocumentFragment();

    scriptData.forEach(({ src, clean, ...attrs }) => {
        if (!src) return;

        const scriptElement = document.createElement('script');
        scriptElement.setAttribute('src', src);
        Object.entries(attrs).forEach(([key, value]) => {
            scriptElement.setAttribute(key, value);
        });

        if (clean) {
            scriptElement.onload = () => document.body.removeChild(scriptElement);
        }

        scriptFragment.appendChild(scriptElement);
    });

    document.body.appendChild(scriptFragment);
}

export const intersectObjects = (
    obj1: { [key: string]: any },
    obj2: { [key: string]: any }
): { [key: string]: any } => {
    const result: { [key: string]: any } = {};

    for (const key in obj1) {
        if (obj1.hasOwnProperty(key) && key in obj2) {
            result[key] = obj1[key];
        }
    }

    return result;
}

export const replaceVariables = (
    pattern: string,
    metaObject: { [key: string]: string | undefined }
): string => {
    const matches = pattern.match(/{[^}]*}/g) || [];

    matches.forEach(match => {
        const key = match.slice(1, -1).split(":");
        const varName = key[0]; // Nome della variabile
        const funcName = key[1]; // Nome della funzione

        // Controlla se funcName è una funzione nel converter
        const value = (funcName && typeof converter[funcName] === 'function'
            ? converter[funcName](metaObject[varName])
            : metaObject[varName]
        )  || '';

        pattern = pattern.replaceAll(match, value);
    });

    return pattern;
};



export const arrayUnique = <T>(array: T[], key?: keyof T): T[] => {
    if (!key) {
        return [...new Set(array)];
    } else {
        const seen = new Set();
        return array.filter((item: T) => {
            const value = item[key];
            if (!seen.has(value)) {
                seen.add(value);
                return true;
            }
            return false;
        });
    }
};

export const isEmpty = (data: any): boolean => {
    return data === undefined || data === null || data === '';
};


export function safeClone<T>(obj: T): T {
    return typeof structuredClone === 'function'
        ? structuredClone(obj)
        : JSON.parse(JSON.stringify(obj))
}


