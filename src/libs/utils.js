import {converter} from "./converter.js";

export const decodeJWT = (token) => {
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
export const copyToClipboard = (text) => {
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

export const trimPath = (path) => {
    return normalizePath(path)
        .replace(/\/$/, "")
        .replace(/^\//, "");
};

export const normalizePath = (path) => {
    return path
        .replaceAll(" ", "-")
        .replaceAll("'", "-")
        .replaceAll('"', "-")
        .toLowerCase()
        .replace(/[^a-z0-9\-/]+/g, "")
        .replace(/-+/g, "-")
        .replace(/\/+/g, "/");
};

export const trimSlash = (path) => {
    return (path && path.startsWith('/')
            ? path.substring(1)
            : path
    );
};

export const normalizeKey = (key) => {
    if(!key) return null;

    return trimSlash(key)
        .trim()
        .replaceAll("/", "|")
        .replaceAll(" ", "-")
        .replaceAll("'", "-")
        .replaceAll('"', "-")
        .replaceAll(".", "-")
        .replaceAll("#", "-")
        .replaceAll("$", "-")
        .replaceAll("[", "-")
        .replaceAll("]", "-")
        .replaceAll("_", "-")
        .toLowerCase()
        .replace(/[^a-z0-9\-|]+/g, "");
};



export const dirname = (path) => {
    // Controlla se il path è una stringa vuota
    if (!path) {
        return "";
    }

    // Rimuovi lo slash finale se presente
    path = path.replace(/\/$/, "");

    // Separa il path in segmenti usando la barra di divisione
    const segments = path.split("/");

    // Rimuovi l'ultimo segmento (il nome del file)
    segments.pop();

    // Ricostruisci il percorso della directory padre
    return segments.join("/");
};

export async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function proxy(url, format = 'json') {
    return (
        process.env.REACT_APP_PROXY_API
            ? process.env.REACT_APP_PROXY_API + encodeURIComponent(url) + "&f=" + format
            : url
    );
}

export function generateUniqueId(name) {
    const timestamp = Date.now().toString(36); // Converti il timestamp in base 36
    const randomStr = name || Math.random().toString(36).substring(2); // Genera una stringa casuale

    return `${timestamp}-${randomStr}`;
}

export function eventClosest(e, tagName) {
    // Se il target è già un elemento con il tag desiderato, restituisci il target stesso
    if (e.target.tagName.toLowerCase() === tagName.toLowerCase()) {
        return e.target;
    }

    // Risali fino a trovare il primo elemento con il tag desiderato
    let currentElement = e.target;

    while (currentElement.parentNode) {
        if (currentElement.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
            // Trovato un elemento con il tag desiderato nel cammino verso l'alto
            return currentElement.parentNode;
        }
        currentElement = currentElement.parentNode;
    }

    // Se non hai trovato un elemento con il tag desiderato, restituisci null
    return null;
}

export const substrCount = (str, sub) => {
    return str.split(sub).length - 1;
};


export const replacePlaceholders = (pattern, arrPath) => {
    return pattern.replace(/\$(\d+)/g, (match, placeholderIndex) => {
        const index = parseInt(placeholderIndex);
        return arrPath[index] || "";
    }).trim();
}

export const checkConditions = (conds, metaObject, tokens) => {
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

export const crc32 = (str) => {
    const crcTable = [];
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

export const ucfirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const loadScripts = (scriptData: Array<{ src: string; [key: string]: any }>): void => {
    if (!scriptData.length) return;

    const scriptFragment = document.createDocumentFragment();
    scriptData.forEach(scriptObject => {
        if(!scriptObject.src) return;

        const scriptElement = document.createElement('script');
        Object.keys(scriptObject).forEach(key =>
            scriptElement.setAttribute(key, scriptObject[key])
        );
        scriptFragment.appendChild(scriptElement);
    });

    document.body.appendChild(scriptFragment);
}

export const intersectObjects = (obj1, obj2) => {
    const result = {};
    for (const key in obj1) {
        if (obj1.hasOwnProperty(key) && key in obj2) {
            result[key] = obj1[key];
        }
    }
    return result;
}



export const replaceVariables = (pattern, metaObject) => {
    // Estrae tutte le variabili delimitate da {}
    const matches = pattern.match(/{[^}]*}/g) || [];

    // Per ogni variabile estratta, fa il replace con il valore corrispondente trovato in metaObject
    matches.forEach(match => {
        const key = match.slice(1, -1).split(":"); // Rimuove le parentesi graffe dalla chiave
        const value = (key.length > 1 && converter?.[key[1]]
                ? converter[key[1]](metaObject[key[0]] || '')
                : metaObject[key[0]] || ''
        ); // Ottiene il valore dalla chiave dell'oggetto metaObject, impostando il valore a vuoto se non trovato
        pattern = pattern.replaceAll(match, value); // Sostituisce la variabile con il valore trovato
    });

    return pattern;
}

export const consoleLog = (...args) => {
    if (1 || process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
};

export const arrayUnique = (array, key = null) => {
    if (!key) {
        return [...new Set(array)];
    } else {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (!seen.has(value)) {
                seen.add(value);
                return true;
            }
            return false;
        });
    }
}
